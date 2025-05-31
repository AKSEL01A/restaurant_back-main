import { BlocStatus } from "src/bloc/enums/status.enum";
import { TableRestaurant } from "src/tables/entities/table.entity";

interface BlocDisponibilite {
    blocId: string;
    blocName: string;
    status: BlocStatus;
    tablesDisponibles: TableRestaurant[];
}
