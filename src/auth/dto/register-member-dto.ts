import { IsEmail, IsString } from "class-validator";

export class RegisterMemberDto {

    @IsString()
    @IsEmail()
    email : string;

    @IsString()
    password: string;

    @IsString()
    name : string;

}