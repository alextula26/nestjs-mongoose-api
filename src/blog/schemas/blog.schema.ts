import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { trim } from 'lodash';
import { HydratedDocument, Model } from 'mongoose';
import { BlogDto } from '../dto/blog.dto';
import { CreateBlogDto, UpdateBlogDto, BlogStaticsType } from '../types';

@Schema()
export class Blog {
  @Prop({
    type: String,
    required: [true, 'The id field is required'],
  })
  id: string;

  @Prop({
    type: String,
    required: [true, 'The name field is required'],
    trim: true,
    minLength: [3, 'The name field must be at least 3, got {VALUE}'],
    maxLength: [15, 'The name field must be no more than 15, got {VALUE}'],
  })
  name: string;

  @Prop({
    type: String,
    required: [true, 'The description field is required'],
    trim: true,
    minLength: [3, 'The description field must be at least 3, got {VALUE}'],
    maxLength: [
      500,
      'The description field must be no more than 500, got {VALUE}',
    ],
  })
  description: string;

  @Prop({
    type: String,
    required: [true, 'The websiteUrl field is required'],
  })
  websiteUrl: string;

  @Prop({
    type: Boolean,
    required: [true, 'The isMembership field is required'],
  })
  isMembership: boolean;

  @Prop({
    type: String,
    required: [true, 'The createdAt field is required'],
    trim: true,
  })
  createdAt: string;

  setName(name: string) {
    if (!trim(name)) throw new Error('Bad name value!');
    this.name = name;
  }

  setDescription(description: string) {
    if (!trim(description)) throw new Error('Bad description value!');
    this.description = description;
  }

  setWebsiteUrl(websiteUrl: string) {
    if (!trim(websiteUrl)) throw new Error('Bad websiteUrl value!');
    this.websiteUrl = websiteUrl;
  }

  updateAllBlog({ name, description, websiteUrl }: UpdateBlogDto) {
    this.setName(name);
    this.setDescription(description);
    this.setWebsiteUrl(websiteUrl);
  }

  static make(
    { name, description, websiteUrl }: CreateBlogDto,
    BlogModel: BlogModelType,
  ): BlogDocument {
    const blogName = trim(String(name));
    const blogDescription = trim(String(description));
    const blogWebsiteUrl = trim(String(websiteUrl));
    const blog = new BlogDto(blogName, blogDescription, blogWebsiteUrl);

    return new BlogModel(blog);
  }
}

export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocument> & BlogStaticsType;
export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {
  setName: Blog.prototype.setName,
  setDescription: Blog.prototype.setDescription,
  setWebsiteUrl: Blog.prototype.setWebsiteUrl,
  updateAllBlog: Blog.prototype.updateAllBlog,
};

BlogSchema.statics = {
  make: Blog.make,
};
