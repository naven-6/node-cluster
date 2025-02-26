import express, { Request, Response, Application } from 'express'
import cluster from 'cluster'
import os from 'os'
import http from 'http';
console.log(os.cpus().length)
const totalCPUs = os.cpus().length
const port = 2001
if (cluster.isPrimary) {
    console.log(`Number of CPUs is ${totalCPUs}`);
    console.log(`Primary ${process.pid} is running`);
  
    // Fork workers.
    for (let i = 0; i < totalCPUs; i++) {
      cluster.fork();
    }
  
    cluster.on("exit", (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
      console.log("Let's fork another worker!");
      cluster.fork();
    });
  } else {
    const app = express();
    console.log(`Worker ${process.pid} started`);
  
    app.get("/", (req, res) => {
      res.send("Hello World!");
    });
  
    app.get("/api/:n", function (req, res) {
      let n = parseInt(req.params.n);
      let count = 0;
  
      if (n > 5000000000) n = 5000000000;
  
      for (let i = 0; i <= n; i++) {
        count += i;
      }
  
      res.send(`Final count is ${count} ${process.pid}`);
    });
  
    const server = http.createServer(app);
    
    server.listen(port, "127.0.0.1", () => {
        console.log(`Worker ${process.pid} is listening on port ${port}`);
    });
  }


