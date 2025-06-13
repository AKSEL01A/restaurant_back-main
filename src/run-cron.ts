// run-cron.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ReservationsService } from './reservations/reservations.service';

async function run() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const taskService = app.get(ReservationsService);
    await taskService.notifyPendingConfirmations(); // appel manuel de la fonction cron
    await app.close();
}
run();
