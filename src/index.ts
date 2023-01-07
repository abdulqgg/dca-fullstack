import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from 'express';
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import session from "express-session";
import * as redis from "redis";
import connectRedis from "connect-redis";
import { MyContext } from "./types";


const main = async () => {
    
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();

    const app = express();

    const RedidStore = connectRedis(session);
    const redisClient = redis.createClient({

    });

    app.use(
        session({
          secret: 'keyboard cat',
          resave: false,
          saveUninitialized: false,
          cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            httpOnly: true,
            sameSite: true,
          },
        })
      );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }): MyContext => ({ em: orm.em, req, res })
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({ app, cors: {credentials: true} });

    app.listen(4000, () => {
        console.log('server started on localhost:4000')
    })

};

main().catch((err) => {
    console.error(err);
});