import { Response } from 'express'
import { JwtService } from '@nestjs/jwt'
import { Injectable } from '@nestjs/common'
import { StatusCodes } from 'enums/statusCodes'
import { ResponseService } from './response.service'

@Injectable()
export class MiscService {
    private response: ResponseService

    constructor(private readonly jwtService: JwtService) {
        this.response = new ResponseService()
    }

    async generateNewAccessToken({ sub, role, status, modelName, centerId }: JwtPayload) {
        return await this.jwtService.signAsync({ sub, role, status, modelName, centerId })
    }

    handleServerError(res: Response, err?: any, msg?: string) {
        console.error(err)
        return this.response.sendError(res, StatusCodes.InternalServerError, msg || err?.message || 'Something went wrong')
    }

    async validateAndDecodeToken(token: string) {
        try {
            return await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET
            })
        } catch (err) {
            console.error(err)
            return null
        }
    }
}