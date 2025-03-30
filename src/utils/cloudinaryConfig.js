/**
 * Cloudinary configuration settings
 */
const cloudinaryConfig = {
  cloudName: 'djjew9552', // Updated with your actual Cloudinary cloud name
  uploadPreset: 'food_donation',
  apiUrl: 'https://api.cloudinary.com/v1_1',
  
  // Set to false since we're handling the uploads on the backend
  useLocalImages: true,
  
  // Helper method to get full upload URL
  getUploadUrl() {
    return `${this.apiUrl}/${this.cloudName}/image/upload`;
  },
  
  // Image transformations
  transforms: {
    thumbnail: 'c_thumb,w_200,h_200,g_face',
    medium: 'c_scale,w_500',
    large: 'c_scale,w_1000',
  },
  
  // Helper to get transformed URL
  getTransformedUrl(publicId, transform) {
    if (!publicId) return '/images/default-food.jpg';
    
    // If it's a data URL or a full URL, return as is
    if (publicId.startsWith('data:') || 
        publicId.startsWith('http') || 
        publicId.startsWith('/')) {
      return publicId;
    }
    
    // If cloudinary.com is in the URL, it's already a Cloudinary URL
    if (publicId.includes('cloudinary.com')) {
      return publicId;
    }
    
    // Otherwise, construct the URL with the transformation
    const transformString = this.transforms[transform] || '';
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformString}/${publicId}`;
  },
  
  // Use this to create a local image URL from a File object
  async getLocalImageUrl(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
};

export default cloudinaryConfig; 