export interface AdminLevel {
    key: number;
    adminLevel: number;
    title: string;
}

export interface SetAdminLevel {
    key: number;
    adminLevel: AdminLevel['adminLevel'],
    geojson: unknown;
}

export interface AdminSet {
    title: string;
    adminLevels: SetAdminLevel[];
}
