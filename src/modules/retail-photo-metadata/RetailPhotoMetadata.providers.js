const { RetailPhotoMetadata } = require('@models');

const RetailPhotoMetadataProviders = {
  async getRetailPhotographyMetadata(year, month) {
    try {
      const metadata = await RetailPhotoMetadata.findOne({ year, month });

      return metadata;
    } catch (error) {
      return Promise.reject(error);
    }
  },
};

module.exports = RetailPhotoMetadataProviders;
