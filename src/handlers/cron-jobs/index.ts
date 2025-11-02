import env from "../../config/env";
import Outbox from "../../services/Outbox";
import axios from "axios";
import {EnvKey} from "../../config/env";

export async function processOutbox() {
    await Outbox.process();
}

export async function ping() {
    const response = await axios.get(`${env(EnvKey.MAIN_API)}/ping`);
    console.log(response.data);
}