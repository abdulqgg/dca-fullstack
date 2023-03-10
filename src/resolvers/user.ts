import { User } from "../entities/User";
import { MyContext } from "../types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2';
import session from "express-session";

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string;
    @Field()
    password: string;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];

    @Field(() => User, {nullable: true})
    user?: User;
}

@Resolver()
export class UserResolver {

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
    ): Promise<UserResponse> {

        if (options.username.length <= 2) {
            return {
                errors: [{
                    field: 'username',
                    message: 'username is too short'
                }]
            }
        }

        const hashedPassword = await argon2.hash(options.password)
        const user = em.create(User, { 
            createdAt: new Date(),
            updatedAt: new Date(),
            username: options.username,
            password: hashedPassword,
        })
        try {
            await em.persistAndFlush(user)
        }catch(err) {
            // duplicate username error   
            if (err.code === '2305' || err.detail.includes('already exists')) {
                return {
                    errors: [{
                        field: 'username',
                        message: 'username already exists'
                    }]
                }
            }    
        }

        return {
            user
        };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext & { req: Request & { session: session.Session & { userId: number } } }
    ): Promise<UserResponse> {
        const user = await em.findOne(User, {username: options.username})
        if (!user){
            return {
                errors: [{
                    field: 'username',
                    message: 'thats usernmae does not exist'
                }]
            }
        }
        const valid = await argon2.verify(user.password, options.password);
        if (!valid){
            return {
                errors: [{
                    field: 'password',
                    message: 'incorrect password'
                }]
            }
        }

        req.session.userId = user.id;
        
        return {
            user,
        };
    }
}
