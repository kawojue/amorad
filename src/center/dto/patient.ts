import {
    IsEmail, IsOptional, IsString,
    IsPhoneNumber, IsEnum, MaxLength,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { Gender, MaritalStatus } from '@prisma/client'
import { titleText, toLowerCase } from 'helpers/transformer'

export class AddPatientDTO {
    @ApiProperty({
        example: 'John Doe'
    })
    @IsString()
    @Transform(({ value }) => titleText(value))
    fullname: string

    @ApiProperty({
        example: 'alwasyappear@gmail.com'
    })
    @IsEmail()
    @IsString()
    @Transform(({ value }) => toLowerCase(value))
    email: string

    @ApiProperty({
        example: '+2348131911964'
    })
    @MaxLength(14)
    @IsPhoneNumber()
    phone: string

    @ApiProperty({
        enum: Gender
    })
    @IsEnum(Gender)
    gender: Gender

    @ApiProperty({
        example: 'My home address'
    })
    @IsString()
    address: string

    @ApiProperty({
        example: new Date()
    })
    dob: string

    @ApiProperty({
        example: 12345678907
    })
    @IsOptional()
    @MaxLength(11)
    nin: string

    @ApiProperty({
        example: '106101'
    })
    @IsString()
    @IsOptional()
    zip_code: string

    @ApiProperty({
        enum: MaritalStatus
    })
    @IsEnum(MaritalStatus)
    marital_status: MaritalStatus
}