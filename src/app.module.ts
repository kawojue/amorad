import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AppService } from './app.service'
import { MiscService } from 'lib/misc.service'
import { AuthModule } from './auth/auth.module'
import { AppController } from './app.controller'
import { PrismaService } from 'lib/prisma.service'
import { CenterModule } from './center/center.module'
import { ResponseService } from 'lib/response.service'
import { EncryptionService } from 'lib/encryption.service'
import { AdradospecModule } from './adradospec/adradospec.module'

@Module({
  imports: [
    AuthModule,
    CenterModule,
    AdradospecModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    MiscService,
    PrismaService,
    ResponseService,
    EncryptionService,
  ],
})
export class AppModule { }
