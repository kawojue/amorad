import { IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { InfiniteScrollWithSearchDto } from './filter.dto'

enum Role {
    doctor = "doctor",
    radiologist = "radiologist",
    centerAdmin = "centerAdmin",
}

export class FetchStaffDto extends InfiniteScrollWithSearchDto {
    @ApiProperty({
        enum: Role
    })
    @IsEnum(Role)
    role: Role
}

enum Chart {
    montly = "monthly",
    weekdays = "weekdays",
}

export class ChartDTO {
    @ApiProperty({
        enum: Chart
    })
    @IsEnum(Chart)
    q: Chart
}