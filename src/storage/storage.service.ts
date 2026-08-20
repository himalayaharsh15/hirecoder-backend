import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class StorageService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),

      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),

      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadResume(buffer: Buffer, fileName: string): Promise<string> {
    console.log('Cloudinary config:', {
      cloudName: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      apiKey: this.configService.get<string>('CLOUDINARY_API_KEY'),
      secretLength: this.configService.get<string>('CLOUDINARY_API_SECRET')
        ?.length,
    });
    try {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'hirecoder/resumes',

            resource_type: 'raw',

            public_id: fileName
              .replace(/\.[^/.]+$/, '')
              .replace(/[^a-zA-Z0-9-_]/g, '_'),
          },

          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(result);
          },
        );

        uploadStream.end(buffer);
      });

      return result.secure_url;
    } catch (error) {
      console.error('Resume upload to Cloudinary failed:', error);

      throw new ServiceUnavailableException('Unable to store resume file.');
    }
  }
}
