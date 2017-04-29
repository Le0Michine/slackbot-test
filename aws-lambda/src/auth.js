import { appToken } from './env';

export default function isAuthorized(token) {
    return token === appToken();
}
