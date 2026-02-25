import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from "passport-jwt";
import passport from "passport";

const JWT_SECRET = process.env.JWT_SECRET || "ZEN_STORE_SECRET";

const cookieExtractor = (req: any) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["token"];
  }
  return token;
};

const options: StrategyOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: JWT_SECRET,
  ignoreExpiration: false,
};

passport.use(
  new JwtStrategy(options, async (jwtPayload, done) => {
    try {
      return done(null, jwtPayload);
    } catch (e) {
      return done(e, false);
    }
  })
);

export const requireAuth = passport.authenticate("jwt", { session: false });
export default passport;
