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
import { createClient } from "redis";
import connectRedis from "connect-redis";
import { MyContext } from "./types";


const main = async () => {
    
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();

    const app = express();

    const RedisStore = connectRedis(session)
    const redisClient = createClient({ legacyMode: true })
    //redisClient.connect().catch(console.error)
    
    app.use(
      session({
        name: 'qid', // name for cookie
        store: new RedisStore({ 
            client: redisClient,
            disableTTL: true,
            disableTouch: true
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
            httpOnly: true,
            sameSite: 'lax',
            secure: __prod__// cookie only works in https
        },
        saveUninitialized: false,
        secret: "ihwkdhidsufdniek", // password for cookie
        resave: false,
      })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }): MyContext => ({ em: orm.em, req, res })
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log('server started on localhost:4000')
    })

};

main().catch((err) => {
    console.error(err);
});
