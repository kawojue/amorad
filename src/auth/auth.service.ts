import { Roles } from '@prisma/client'
import { LoginDto } from './dto/login.dto'
import { Request, Response } from 'express'
import { Injectable } from '@nestjs/common'
import { MiscService } from 'lib/misc.service'
import { StatusCodes } from 'enums/statusCodes'
import { PrismaService } from 'lib/prisma.service'
import { getIpAddress } from 'helpers/getIPAddress'
import { ResponseService } from 'lib/response.service'
import { EncryptionService } from 'lib/encryption.service'
import { OrganizationSignupDto, PractitionerSignupDto } from './dto/signup.dto'

@Injectable()
export class AuthService {
    constructor(
        private readonly misc: MiscService,
        private readonly prisma: PrismaService,
        private readonly response: ResponseService,
        private readonly encryption: EncryptionService,
    ) { }

    async practitionerSignup(
        res: Response,
        {
            fullname, address, affiliation, email, country, state,
            city, password, practiceNumber, profession, phone, zip_code,
        }: PractitionerSignupDto
    ) {
        try {
            const role = profession.toLowerCase() as Roles

            const isExists = await this.prisma.practitioner.findFirst({
                where: {
                    OR: [
                        { email: { equals: email, mode: 'insensitive' } },
                        { practiceNumber: { equals: practiceNumber, mode: 'insensitive' } },
                    ]
                }
            })

            if (isExists) {
                return this.response.sendError(res, StatusCodes.Conflict, "Email or practice number already exist.")
            }

            password = await this.encryption.hashAsync(password)

            await this.prisma.practitioner.create({
                data: {
                    address, affiliation, phone,
                    city, state, country, zip_code,
                    email, fullname, role, password,
                    practiceNumber, status: 'PENDING',
                }
            })

            // TODO: mailing

            this.response.sendSuccess(res, StatusCodes.Created, {
                message: "You will be notified when you're verified by our specialist."
            })
        } catch (err) {
            this.misc.handleServerError(res, err)
        }
    }

    async organizationSignup(
        req: Request,
        res: Response,
        {
            organizationName, fullname, address, state,
            city, country, email, password, phone, zip_code
        }: OrganizationSignupDto
    ) {
        try {
            email = email.trim().toLowerCase()
            password = await this.encryption.hashAsync(password)

            const isExist = await this.prisma.center.findFirst({
                where: {
                    OR: [
                        { email: { equals: email, mode: 'insensitive' } },
                        { centerName: { equals: organizationName, mode: 'insensitive' } }
                    ]
                }
            })

            if (isExist) {
                return this.response.sendError(res, StatusCodes.Conflict, "Organization already exist")
            }

            const center = await this.prisma.center.create({
                data: {
                    address, state, country, zip_code, phone,
                    status: 'PENDING', ip: getIpAddress(req),
                    email, centerName: organizationName, city,
                }
            })

            if (center) {
                await this.prisma.centerAdmin.create({
                    data: {
                        fullname, email, phone,
                        password, superAdmin: true,
                        status: 'PENDING', role: 'centerAdmin',
                        center: { connect: { id: center.id } },
                    }
                })
            }

            // Todo: mailing

            this.response.sendSuccess(res, StatusCodes.Created, {
                message: "You'll be notified when your organization is verified by our admin"
            })
        } catch (err) {
            this.misc.handleServerError(res, err)
        }
    }

    async login(
        res: Response,
        { email, password }: LoginDto
    ) {
        try {
            const centerAdmin = await this.prisma.centerAdmin.findUnique({
                where: { email },
                include: { center: true }
            })

            const systemPractitioner = await this.prisma.practitioner.findUnique({
                where: { email },
                include: { assignedPatients: true }
            })

            const centerPractitioner = await this.prisma.centerPractitioner.findUnique({
                where: { email },
                include: { center: true, assignedPatients: true }
            })

            if (!centerAdmin && !systemPractitioner && !centerPractitioner) {
                return this.response.sendError(res, StatusCodes.NotFound, 'Invalid email or password')
            }

            let data = {} as ILogin
            let isPasswordCorrect: boolean = false

            if (centerAdmin || centerPractitioner) {
                const user = centerAdmin || centerPractitioner

                if (user.center.status === "PENDING") {
                    return this.response.sendError(res, StatusCodes.Unauthorized, 'Your organization is pending verification')
                }

                if (user.center.status === "SUSPENDED" || user.status === "SUSPENDED") {
                    return this.response.sendError(res, StatusCodes.Forbidden, 'Your organization or account has been suspended')
                }

                if (centerAdmin) {
                    isPasswordCorrect = await this.encryption.compareAsync(password, centerAdmin.password)

                    data = {
                        id: centerAdmin.id,
                        role: centerAdmin.role,
                        status: centerAdmin.status,
                        route: `${centerAdmin.center.id}/dashboard`,
                    }
                }

                if (centerPractitioner) {
                    if (centerPractitioner.assignedPatients.length === 0) {
                        return this.response.sendError(res, StatusCodes.Conflict, "No patients were assigned to you")
                    }

                    isPasswordCorrect = await this.encryption.compareAsync(password, centerPractitioner.password)

                    data = {
                        id: centerPractitioner.id,
                        route: `assigned-patients`,
                        role: centerPractitioner.role,
                        status: centerPractitioner.status,
                    }
                }
            }

            if (systemPractitioner) {
                if (systemPractitioner.assignedPatients.length === 0) {
                    return this.response.sendError(res, StatusCodes.Conflict, "No patients were assigned to you")
                }

                isPasswordCorrect = await this.encryption.compareAsync(password, systemPractitioner.password)

                data = {
                    id: systemPractitioner.id,
                    route: `assigned-patients`,
                    role: systemPractitioner.role,
                    status: systemPractitioner.status,
                }
            }

            if (!isPasswordCorrect) {
                return this.response.sendError(res, StatusCodes.Unauthorized, "Incorrect password")
            }

            const access_token = await this.misc.generateNewAccessToken({
                sub: data.id,
                role: data.role,
                status: data.status,
            })

            this.response.sendSuccess(res, StatusCodes.OK, {
                data,
                access_token,
                message: "Login successful"
            })
        } catch (err) {
            this.misc.handleServerError(res, err)
        }
    }
}
