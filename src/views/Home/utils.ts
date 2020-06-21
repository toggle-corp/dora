import { isDefined, getDuplicates, isNotDefined, listToMap, findDifferenceInList } from '@togglecorp/fujs';

import {
    Settings,
    Code,
    AdminLevel,
    Pointer,
    GeoJsonFeature,
} from './typings';

function getCanonicalName(value: string) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

interface Property {
    index: number;
    code?: Code;
    name?: string;
    parentCode?: Code;
    // parentName?: string;
}
interface Error {
    title: string;
    severity: 'error' | 'warning';
    description?: string;
}

export function getProperty(pointer: Pointer, feature: GeoJsonFeature) {
    return {
        code: isDefined(pointer.code)
            ? (feature.properties[pointer.code]) as Code | undefined
            : undefined,
        name: isDefined(pointer.name)
            ? (feature.properties[pointer.name]) as string | undefined
            : undefined,
        parentCode: isDefined(pointer.parentCode)
            ? (feature.properties[pointer.parentCode]) as Code | undefined
            : undefined,
        /*
        parentName: isDefined(pointer.parentName)
            ? (feature.properties[pointer.parentName]) as string | undefined
            : undefined,
        */
    };
}

export function getProperties(settings: Settings) {
    const {
        geoJson,
        pointer,
    } = settings;

    return geoJson.features.map((feature, index) => ({
        index,
        ...getProperty(pointer, feature),
    }));
}

// NOTE: No need to validate parentCode validation for `root`
function validateSettings(settings: Settings, root = false): Error[] {
    function getErrors(
        geo: Property[],
        id: keyof Property,
        checkDuplicates = false,
    ): Error[] {
        const errors: Error[] = [];
        const empty = geo.filter((item) => isNotDefined(item[id]));
        if (empty.length > 0) {
            errors.push({
                title: `'${id}' not defined for ${empty.length} items`,
                description: `Index: ${empty.map((item) => item.index).join(', ')}`,
                severity: 'error',
            });
        }

        if (checkDuplicates) {
            const duplicates = getDuplicates(
                geo.map((item) => item[id]).filter(isDefined),
                (item) => item,
            );
            if (duplicates.length > 0) {
                errors.push({
                    title: `'${id}' has duplicates for ${duplicates.length} items`,
                    description: `Code: ${duplicates.join(',')}`,
                    severity: 'error',
                });
            }
        }
        return errors;
    }


    const properties = getProperties(settings);

    const codeErrors = getErrors(properties, 'code', true);
    const nameErrors = getErrors(properties, 'name');
    const parentCodeErrors = root ? [] : getErrors(properties, 'parentCode');
    // const parentNameErrors = root ? [] : getErrors(properties, 'parentName');

    return [
        ...codeErrors,
        ...parentCodeErrors,
        ...nameErrors,
        // ...parentNameErrors,
    ];
}
function validateSettingsRelation(parent: Settings, child: Settings): Error[] {
    const errors: Error[] = [];

    const parentProperties = getProperties(parent);
    const parentCodes = new Set(
        parentProperties
            .map((item) => item.code)
            .filter(isDefined),
    );

    const childProperties = getProperties(child);

    const badChildren = childProperties.filter(
        (item) => isDefined(item.parentCode) && !parentCodes.has(item.parentCode),
    );
    if (badChildren.length > 0) {
        errors.push({
            title: `'parentCode' not valid for ${badChildren.length} items.`,
            description: `Index: ${badChildren.map((item) => item.index).join(', ')}`,
            severity: 'error',
        });
    }
    return errors;
}

// eslint-disable-next-line import/prefer-default-export
export function validate(adminLevels: AdminLevel[], settingsCollection: Settings[]) {
    const errorMapping: {
        [key: string]: Error[];
    } = listToMap(
        adminLevels,
        (adminLevel) => adminLevel.key,
        () => [],
    );

    settingsCollection.forEach((settings, index) => {
        // FIXME: better way to identify root
        const errors = validateSettings(settings, index === 0);
        if (errors.length > 0) {
            errorMapping[settings.adminLevel].push(...errors);
        }
    });
    settingsCollection.forEach((settings, index) => {
        const parentSettings = settingsCollection[index - 1];
        if (!parentSettings) {
            return;
        }
        const errors = validateSettingsRelation(parentSettings, settings);
        if (errors.length > 0) {
            errorMapping[settings.adminLevel].push(...errors);
        }
    });

    return errorMapping;
}

export interface Link {
    from?: number;
    to?: number;
}

// NOTE:
// - Add all of them with same which are not duplicates
function generateUnitMapping(unitFoo: Settings, unitBar: Settings) {
    const fooProperties = getProperties(unitFoo);
    const fooDuplicateNames = getDuplicates(
        fooProperties
            .map((item) => item.name)
            .filter(isDefined)
            .map(getCanonicalName),
        (item) => item,
    );
    const fooDuplicateNamesSet = new Set(fooDuplicateNames);
    const validFooProperties = fooProperties.filter(
        (item) => isDefined(item.name) && !fooDuplicateNamesSet.has(getCanonicalName(item.name)),
    );
    const invalidFooProperties = fooProperties.filter((item) => (
        isNotDefined(item.name) || fooDuplicateNamesSet.has(getCanonicalName(item.name))
    ));

    const barProperties = getProperties(unitBar);
    const barDuplicateNames = getDuplicates(
        barProperties
            .map((item) => item.name)
            .filter(isDefined)
            .map(getCanonicalName),
        (item) => item,
    );
    const barDuplicateNamesSet = new Set(barDuplicateNames);
    const validBarProperties = barProperties.filter(
        (item) => isDefined(item.name) && !barDuplicateNamesSet.has(getCanonicalName(item.name)),
    );
    const invalidBarProperties = barProperties.filter((item) => (
        isNotDefined(item.name) || barDuplicateNamesSet.has(getCanonicalName(item.name))
    ));

    const {
        added,
        modified,
        removed,
        // unmodified, // NOTE: we will note have unmodified at all
    } = findDifferenceInList(
        validFooProperties,
        validBarProperties,
        (item) => getCanonicalName(item.name),
    );
    // NOTE: name is defined here

    const links: Link[] = [];
    links.push(...added.map((item) => ({ to: item.index })));
    links.push(...invalidBarProperties.map((item) => ({ to: item.index })));

    links.push(...removed.map((item) => ({ from: item.index })));
    links.push(...invalidFooProperties.map((item) => ({ from: item.index })));

    links.push(...modified.map((item) => ({ from: item.old.index, to: item.new.index })));

    return links;
}

export function generateMapping(adminLevels: AdminLevel[], foo: Settings[], bar: Settings[]) {
    const linkMapping : {
        [key: string]: Link[];
    } = listToMap(
        adminLevels,
        (adminLevel) => adminLevel.key,
        () => [],
    );

    adminLevels.forEach((adminLevel) => {
        const unitFoo = foo.find((item) => item.adminLevel === adminLevel.key);
        const unitBar = bar.find((item) => item.adminLevel === adminLevel.key);
        if (!unitFoo || !unitBar) {
            console.error(`Admin level '${adminLevel.key}' must be defined for both sets`);
            return;
        }
        linkMapping[adminLevel.key] = generateUnitMapping(unitFoo, unitBar);
    });

    return linkMapping;
}
