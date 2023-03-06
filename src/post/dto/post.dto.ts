import { IntersectionType } from '@nestjs/mapped-types';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePostBaseDto {
  @IsNotEmpty({
    message: 'The title field is required',
  })
  @Transform(({ value }) => value.trim())
  @MinLength(3, {
    message: 'The title field must be at least 3, got $value',
  })
  @MaxLength(30, {
    message: 'The title field must be no more than 30, got $value',
  })
  title: string;

  @IsNotEmpty({
    message: 'The shortDescription field is required',
  })
  @Transform(({ value }) => value.trim())
  @MinLength(3, {
    message: 'The shortDescription field must be at least 3, got $value',
  })
  @MaxLength(100, {
    message: 'The shortDescription field must be no more than 100, got $value',
  })
  shortDescription: string;

  @IsNotEmpty({
    message: 'The content field is required',
  })
  @Transform(({ value }) => value.trim())
  @MinLength(3, {
    message: 'The content field must be at least 3, got $value',
  })
  @MaxLength(1000, {
    message: 'The content field must be no more than 1000, got $value',
  })
  content: string;
}

export class BlogIdDto {
  @IsNotEmpty({
    message: 'The blogId field is required',
  })
  @Transform(({ value }) => value.trim())
  @MinLength(1, {
    message: 'The blogId field must be at least 1, got $value',
  })
  @MaxLength(20, {
    message: 'The blogId field must be no more than 20, got $value',
  })
  blogId: string;
}

export class CreatePostDto extends IntersectionType(
  CreatePostBaseDto,
  BlogIdDto,
) {}

export class UpdatePostDto extends CreatePostDto {}
