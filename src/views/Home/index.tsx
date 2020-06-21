import React, { useState, useCallback, useMemo } from 'react';
import { _cs, isDefined, isNotDefined } from '@togglecorp/fujs';
import produce from 'immer';

import Button from '#components/Button';
import SegmentInput from '#components/SegmentInput';

import oldCountry from '#resources/admin0.json';
import oldDepartment from '#resources/admin1.json';
import oldMuni from '#resources/admin2.json';

import newCountry from '#resources/new-admin0.json';
import newDepartment from '#resources/new-admin1.json';
import newMuni from '#resources/new-admin2.json';

import AdminLevels from './AdminLevels';
import Sets from './Sets';
import Map from './ComparisonMap';
import {
    AdminLevel,
    AdminSet,
    GeoJson,
} from './typings';
import {
    generateMapping,
    Link,
} from './utils';

import LinkListing from './LinkListing';

import styles from './styles.css';

function addUniqueIds(geoJson: GeoJson) {
    const newFeatures = geoJson.features.map((f, index) => ({
        ...f,
        id: index + 1,
    }));

    return ({
        ...geoJson,
        features: newFeatures,
    });
}

const adminLevels: AdminLevel[] = [
    {
        key: 'country',
        name: 'Country',
        level: 0,
    },
    {
        key: 'department',
        name: 'Department',
        level: 1,
    },
    {
        key: 'municipality',
        name: 'Municipality',
        level: 2,
    },
];

const sets: AdminSet[] = [
    {
        key: 'old-colombia',
        title: 'Old Colombia',
        settings: [
            {
                key: 1,
                adminLevel: 'country',
                geoJson: addUniqueIds(oldCountry) as unknown as GeoJson,
                pointer: {
                    name: 'title',
                    code: 'code',
                    parentCode: undefined,
                    // parentName: undefined,
                },
            },
            {
                key: 2,
                adminLevel: 'department',
                geoJson: addUniqueIds(oldDepartment) as unknown as GeoJson,
                pointer: {
                    name: 'title',
                    code: 'code',
                    parentCode: 'parent',
                    // parentName: undefined,
                },
            },
            {
                key: 3,
                adminLevel: 'municipality',
                geoJson: addUniqueIds(oldMuni) as unknown as GeoJson,
                pointer: {
                    name: 'title',
                    code: 'code',
                    parentCode: 'parent',
                    // parentName: undefined,
                },
            },
        ],
    },
    {
        key: 'new-colombia',
        title: 'New Colombia',
        settings: [
            {
                key: 4,
                adminLevel: 'country',
                geoJson: addUniqueIds(newCountry) as unknown as GeoJson,
                pointer: {
                    name: 'ADM0_ES',
                    code: 'ADM0_PCODE',
                    parentCode: undefined,
                    // parentName: undefined,
                },
            },
            {
                key: 5,
                adminLevel: 'department',
                geoJson: addUniqueIds(newDepartment) as unknown as GeoJson,
                pointer: {
                    name: 'ADM1_ES',
                    code: 'ADM1_PCODE',
                    parentCode: 'ADM0_PCODE',
                    // parentName: undefined,
                },
            },
            {
                key: 6,
                adminLevel: 'municipality',
                geoJson: addUniqueIds(newMuni) as unknown as GeoJson,
                pointer: {
                    name: 'ADM2_ES',
                    code: 'ADM2_PCODE',
                    parentCode: 'ADM1_PCODE',
                    // parentName: undefined,
                },
            },
        ],
    },
];

interface AdminLevelWithCount extends AdminLevel {
    count?: number;
}

const optionKeySelector = (d: AdminLevelWithCount) => d.key;

const optionLabelSelector = (d: AdminLevelWithCount) => (
    isDefined(d.count) ? `${d.name} (${d.count})` : d.name
);

interface Props {
    className?: string;
}

function Home(props: Props) {
    const { className } = props;

    const [currentAdminLevel, setCurrentAdminLevel] = useState(adminLevels[0].key);
    const [mapping, setMapping] = useState<{ [key: string]: Link[] } | undefined>(undefined);

    const firstSet = sets[0];
    const secondSet = sets[1];
    const oldSource = useMemo(() => (
        firstSet.settings.find((s) => s.adminLevel === currentAdminLevel)?.geoJson
    ), [currentAdminLevel]);

    const newSource = useMemo(() => (
        secondSet.settings.find((s) => s.adminLevel === currentAdminLevel)?.geoJson
    ), [currentAdminLevel]);

    const handleCalculate = useCallback(
        () => {
            const newMapping = generateMapping(adminLevels, firstSet.settings, secondSet.settings);
            setMapping(newMapping);
        },
        [firstSet, secondSet],
    );

    const adminLevelsWithCount = useMemo(() => {
        if (!mapping) {
            return adminLevels;
        }
        return adminLevels.map((level) => ({
            ...level,
            count: mapping[level.key]
                .filter((link) => isNotDefined(link.to) || isNotDefined(link.from)).length,
        }));
    }, [mapping]);

    const handleAreasLink = useCallback((to: number, from: number, adminLevel: AdminLevel['key']) => {
        if (
            isNotDefined(mapping)
            || isNotDefined(to)
            || isNotDefined(from)
            || isNotDefined(adminLevel)
        ) {
            return;
        }
        const newMapping = produce(mapping, (safeMapping) => {
            const currentAdminMapping = safeMapping[adminLevel];
            const toIndex = currentAdminMapping.findIndex((map) => map.to === to);
            if (toIndex !== -1) {
                // eslint-disable-next-line no-param-reassign
                safeMapping[adminLevel].splice(toIndex, 1);
            }
            const fromIndex = currentAdminMapping.findIndex((map) => map.from === from);
            if (fromIndex !== -1) {
                // eslint-disable-next-line no-param-reassign
                safeMapping[adminLevel].splice(fromIndex, 1);
            }
            safeMapping[adminLevel].push({
                to,
                from,
            });
        });
        setMapping(newMapping);
    }, [mapping, setMapping]);

    const handleAreasUnlink = useCallback((to: number, from: number, adminLevel: AdminLevel['key']) => {
        if (
            isNotDefined(mapping)
            || isNotDefined(to)
            || isNotDefined(from)
            || isNotDefined(adminLevel)
        ) {
            return;
        }
        const newMapping = produce(mapping, (safeMapping) => {
            const currentAdminMapping = safeMapping[adminLevel];
            const toIndex = currentAdminMapping.findIndex((map) => map.to === to);
            if (
                toIndex !== -1
                && currentAdminMapping[toIndex].from === from
            ) {
                // eslint-disable-next-line no-param-reassign
                safeMapping[adminLevel].splice(toIndex, 1);
                safeMapping[adminLevel].push({
                    to,
                });
                safeMapping[adminLevel].push({
                    from,
                });
            }
        });
        setMapping(newMapping);
    }, [mapping, setMapping]);

    return (
        <div className={_cs(className, styles.home)}>
            <div className={styles.sidebar}>
                <AdminLevels adminLevels={adminLevels} />
                <Sets
                    adminLevels={adminLevels}
                    sets={sets}
                />
                <Button
                    onClick={handleCalculate}
                    variant="primary"
                >
                    Calculate
                </Button>
            </div>
            <div className={styles.mainContent}>
                <SegmentInput
                    className={styles.tabs}
                    options={adminLevelsWithCount}
                    optionKeySelector={optionKeySelector}
                    optionLabelSelector={optionLabelSelector}
                    value={currentAdminLevel}
                    onChange={setCurrentAdminLevel}
                />
                <div className={styles.content}>
                    <Map
                        className={_cs(
                            styles.map,
                            isNotDefined(mapping) && styles.fullMap,
                        )}
                        currentAdminLevel={currentAdminLevel}
                        oldSource={oldSource}
                        newSource={newSource}
                    />
                    <LinkListing
                        className={styles.linkListing}
                        mapping={mapping}
                        currentAdminLevel={currentAdminLevel}
                        firstSet={firstSet}
                        secondSet={secondSet}
                        onAreasLink={handleAreasLink}
                        onAreasUnlink={handleAreasUnlink}
                    />
                </div>
            </div>
        </div>
    );
}

export default Home;
