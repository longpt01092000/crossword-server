import { FileUploadType } from '../upload.model';
import {
  ExposeDate,
  ExposeEnum,
  ExposeId,
  ExposeString,
} from '@common/decorators/expose.decorator';

export class FileUploadResponseDto {
  @ExposeString(
    'Public URL of the uploaded file',
    'https://your-domain.com/uploads/abc123.jpg',
  )
  url: string;

  @ExposeString('Original name of the file (optional)', 'abc123.jpg')
  originalName?: string;

  @ExposeString('S3/Storage key of the file', 'uploads/abc123.jpg')
  key: string;

  @ExposeEnum(FileUploadType, 'Type of the uploaded file', FileUploadType.LOGO)
  type: FileUploadType;

  @ExposeId('MongoDB ObjectId of the file', '64fae6c2b04c9a3e48c793d9')
  _id: string;

  @ExposeDate('Date when the file was uploaded', '2025-07-31T16:20:00.000Z')
  createdAt: Date;

  @ExposeDate('Date when the file was last updated', '2025-07-31T16:21:00.000Z')
  updatedAt: Date;
}
