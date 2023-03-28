import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class BanInfoSchema {
  @Prop({
    type: Boolean,
    default: false,
  })
  isBanned: boolean;

  @Prop({
    type: Date,
    required: [true, 'The banDate field is required'],
  })
  banDate: Date;

  @Prop({
    type: String,
    trim: true,
    default: '',
  })
  banReason: string;
}
