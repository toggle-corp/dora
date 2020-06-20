import { isDefined, getDuplicates, isNotDefined, listToMap } from '@togglecorp/fujs';

import {
    Settings,
    Code,
    AdminLevel,
} from './typings';

interface TransformedGeoJson {
    index: number;
    code?: Code;
    name?: string;
    parentCode?: Code;
    // parentName?: string;
}

function getTransformedGeoJson(settings: Settings) {
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

function validateSettings(settings: Settings, root = false) {
    function getErrors(
        geo: TransformedGeoJson[],
        id: keyof TransformedGeoJson,
        checkDuplicates = false,
    ) {
        const errors: string[] = [];
        const empty = geo.filter((item) => isNotDefined(item[id]));
        if (empty.length > 0) {
            errors.push(`'${id}' not defined for ${empty.length} items: ${empty.map((item) => item.index).join(', ')}`);
        }

        if (checkDuplicates) {
            const duplicates = getDuplicates(
                geo.map((item) => item[id]).filter(isDefined),
                (item) => item,
            );
            if (duplicates.length > 0) {
                errors.push(`'${id}' has duplicates for ${duplicates.length} items: ${duplicates.join(',')}`);
            }
        }
        return errors;
    }


    const transformedGeoJson = getTransformedGeoJson(settings);

    const codeErrors = getErrors(transformedGeoJson, 'code', true);
    const nameErrors = getErrors(transformedGeoJson, 'name');
    const parentCodeErrors = root ? [] : getErrors(transformedGeoJson, 'parentCode');
    // const parentNameErrors = root ? [] : getErrors(transformedGeoJson, 'parentName');

    return [
        ...codeErrors,
        ...parentCodeErrors,
        ...nameErrors,
        // ...parentNameErrors,
    ];
}
function validateSettingsRelation(parent: Settings, child: Settings) {
    const errors: string[] = [];
    const transformedParentGeoJsons = getTransformedGeoJson(parent);
    const temp = transformedParentGeoJsons
        .map((item) => item.code)
        .filter(isDefined);
    const parentCodes = new Set(temp);

    const transformedGeoJsons = getTransformedGeoJson(child);
    const badChildren = transformedGeoJsons
        .filter((item) => isDefined(item.parentCode) && !parentCodes.has(item.parentCode));
    if (badChildren.length > 0) {
        errors.push(`Parents not matching for for ${badChildren.length} items: ${badChildren.map((item) => item.index).join(', ')}`);
    }
    return errors;
}

// eslint-disable-next-line import/prefer-default-export
export function validate(adminLevels: AdminLevel[], set: Settings[]) {
    const errorMapping: {
        [key: string]: string[];
    } = listToMap(
        adminLevels,
        (adminLevel) => adminLevel.key,
        () => [],
    );

    set.forEach((settings, index) => {
        const errors = validateSettings(settings, index === 0);
        if (errors.length > 0) {
            errorMapping[settings.adminLevel].push(...errors);
        }
    });
    set.forEach((settings, index) => {
        const parentSettings = set[index - 1];
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
