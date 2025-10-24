import BaseCache from "./bases/BaseCache";

export default class TokenBlackList extends BaseCache {

    public constructor() {
        super('blacklist');
    }
}