// services/notificationService.js
import Pet from '../models/Pet.js';
import User from '../models/User.js'; // Assuming you have a User model
import schedule from 'node-schedule';

// Function to check for upcoming vaccinations and send notifications
export const checkAndSendVaccinationReminders = async () => {
  try {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    // Find pets with vaccinations due in the next 3 days
    const pets = await Pet.find({
      'vaccinations.dueDate': {
        $gte: today,
        $lte: threeDaysFromNow
      },
      'vaccinations.reminderSent': false
    });

    for (const pet of pets) {
      // Find the owner of the pet
      const owner = await User.findOne({ userId: pet.ownerId });

      if (!owner) continue;

      const upcomingVaccinations = pet.vaccinations.filter(v => {
        const dueDate = new Date(v.dueDate);
        return dueDate >= today && dueDate <= threeDaysFromNow && !v.reminderSent;
      });

      for (const vaccination of upcomingVaccinations) {
        // Here you would implement your notification logic
        // For example, send push notification or email

        console.log(`Sending reminder to ${owner.name} for ${pet.name}'s ${vaccination.name} vaccination due on ${vaccination.dueDate}`);

        // If you have push notification service implemented:
        // await pushNotificationService.sendNotification({
        //   userId: owner.userId,
        //   title: `Vaccination Reminder: ${pet.name}`,
        //   body: `${vaccination.name} is due on ${new Date(vaccination.dueDate).toLocaleDateString()}`
        // });

        // Mark reminder as sent
        vaccination.reminderSent = true;
      }

      await pet.save();
    }

    console.log('Vaccination reminders processed successfully');
  } catch (error) {
    console.error('Error processing vaccination reminders:', error);
  }
};

// Initialize the scheduler
export const initNotificationScheduler = () => {
  // Schedule to run daily at 9:00 AM
  schedule.scheduleJob('0 9 * * *', checkAndSendVaccinationReminders);
  console.log('Vaccination reminder scheduler initialized');
};