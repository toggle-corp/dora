import { isDefined, getDuplicates, isNotDefined, listToMap } from '@togglecorp/fujs';

import {
    Settings,
    Code,
    AdminLevel,
} from './typings';

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

function getProperties(settings: Settings) {
    const {
        geoJson,
        pointer,
    } = settings;

    return geoJson.features.map((feature, index) => ({
        index,
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
