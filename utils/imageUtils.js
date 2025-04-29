import sharp from 'sharp';

export const compressImage = async (base64Image) => {
  try {
    // Remove data:image/jpeg;base64, or similar prefix
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Compress image
    const compressedBuffer = await sharp(buffer)
      .resize(800, 800, { // Max dimensions
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
      .toBuffer();

    return compressedBuffer.toString('base64');
  } catch (error) {
    console.error('Image compression error:', error);
    throw error;
  }
};