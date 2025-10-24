import { Server } from "http";
import cluster from "cluster";
import * as os from "os";

export default async function clusterServer(app: Server, PORT: string) {
    const numCpu = (os.cpus().length) - 2; // TODO: note this

    if (cluster.isPrimary) {
        for (let i = 0; i < numCpu; i++) cluster.fork();

        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
            console.log('Starting a new worker');
            cluster.fork();
        });

        cluster.on('online', (worker) => console.log(`Worker ${worker.process.pid} is online`));
    } else {
        app.listen(PORT, () => console.log(`Server running on port - ${PORT}\n`));
    }
}