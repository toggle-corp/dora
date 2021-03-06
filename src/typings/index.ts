export type Code = string | number;

export interface Pointer {
    code: Code | undefined;
    parentCode: string | undefined;
    name: Code | undefined;
    // parentName: string | undefined;
}

export interface LinkedArea {
    fromFeature: GeoJsonFeature;
    toFeature: GeoJsonFeature;
}

export interface GeoJsonFeature {
    type: string;
    properties: Record<string, unknown>;
    geometry: unknown;
    id: number;
}

// We should use one from mapbox
export interface GeoJson {
    type: string;
    crs?: unknown;
    features: GeoJsonFeature[];
}

export interface AdminLevel {
    key: string;
    level: number;
    name: string;
}

export interface Settings {
    key: number;
    geoJson: GeoJson;
    adminLevel: string;

    pointer: Pointer;
}

export interface AdminSet {
    key: string;
    title: string;
    settings: Settings[];
}

export interface DeletedItemProps {
    from: number;
    name: string;
    code?: string | number;
    feature?: GeoJsonFeature;
}
