import { IsEmail, IsString } from "class-validator";

export class LoginMemberDto {

    @IsString()
    @IsEmail()
    email : string;

    @IsString()
    password: string;
}