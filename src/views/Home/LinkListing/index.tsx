import React, { useState, useCallback, useMemo } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
    caseInsensitiveSubmatch,
} from '@togglecorp/fujs';

import TextOutput from '#components/TextOutput';
import TextInput from '#components/TextInput';
import Button from '#components/Button';
import Modal from '#components/Modal';
import SelectInput from '#components/SelectInput';
import SegmentInput from '#components/SegmentInput';

import {
    AdminLevel,
    AdminSet,
    GeoJson,
} from '../typings';
import {
    getProperty,
    generateMapping,
    Link,
} from '../utils';

import AddedItem from './AddedItem';
import styles from './styles.css';

export interface DeletedItemProps {
    from: number;
    name: string;
    code?: string | number;
    feature?: GeoJson;
}

function DeletedItem(props: DeletedItemProps) {
    const {
        from,
        name,
        code,
    } = props;

    return (
        <div
            className={_cs(styles.deletedItem, styles.item)}
            key={from}
        >
            <h5 className={styles.title}>{name}</h5>
            <TextOutput
                label="Code"
                value={code}
            />
        </div>
    );
}

interface TabOption {
    key: string;
    title: string;
}

const tabOptions: TabOption[] = [
    {
        key: 'unlinked',
        title: 'Unlinked',
    },
    {
        key: 'linked',
        title: 'Linked',
    },
];

const keySelector = (d: TabOption) => d.key;
const titleSelector = (d: TabOption) => d.title;

interface LinkListingProps {
    currentAdminLevel: string;
    mapping: { [key: string]: Link[] } | undefined;
    firstSet: AdminSet;
    secondSet: AdminSet;
    className?: string;
    onAreasLink: (to: number, from: number, adminLevel: AdminLevel['key']) => void;
    onAreasUnlink: (to: number, from: number, adminLevel: AdminLevel['key']) => void;
}
function LinkListing(props: LinkListingProps) {
    const {
        className,
        currentAdminLevel,
        mapping,
        firstSet,
        secondSet,
        onAreasLink,
        onAreasUnlink,
    } = props;

    const [currentTab, setCurrentTab] = useState(tabOptions[0].key);
    const [addedSearchText, setAddedSearchText] = useState('');
    const [deletedSearchText, setDeletedSearchText] = useState('');
    const [linkedSearchText, setLinkedSearchText] = useState('');

    const handleAreasLink = useCallback((to: number, from: number) => {
        onAreasLink(to, from, currentAdminLevel);
    }, [currentAdminLevel, onAreasLink]);

    const handleAreasUnlink = useCallback((to: number, from: number) => {
        onAreasUnlink(to, from, currentAdminLevel);
    }, [currentAdminLevel, onAreasUnlink]);

    const unitMapping = useMemo(() => (
        mapping && mapping[currentAdminLevel]
    ), [currentAdminLevel, mapping]);

    const firstSettings = useMemo(() => (
        firstSet.settings.find((item) => item.adminLevel === currentAdminLevel)
    ), [currentAdminLevel, firstSet]);

    const secondSettings = useMemo(() => (
        secondSet.settings.find((item) => item.adminLevel === currentAdminLevel)
    ), [secondSet, currentAdminLevel]);

    const linked = useMemo(() => {
        if (!unitMapping || !firstSettings || !secondSettings) {
            return [];
        }

        return unitMapping.filter((item) => isDefined(item.from) && isDefined(item.to))
            .map((item) => {
                const fromProperty = getProperty(
                    firstSettings.pointer,
                    firstSettings.geoJson.features[item.from],
                );
                const toProperty = getProperty(
                    secondSettings.pointer,
                    secondSettings.geoJson.features[item.to],
                );
                return {
                    from: item.from,
                    to: item.to,
                    toName: toProperty.name,
                    toCode: toProperty.code,
                    fromName: fromProperty.name,
                    fromCode: fromProperty.code,
                    fromFeature: firstSettings.geoJson.features[item.from],
                    toFeature: secondSettings.geoJson.features[item.to],
                };
            })
            .filter((item) => (
                caseInsensitiveSubmatch(item.toName, linkedSearchText)
                || caseInsensitiveSubmatch(item.fromName, linkedSearchText)
            ));
    }, [unitMapping, linkedSearchText]);

    const deleted: DeletedItemProps[] = useMemo(() => {
        if (!unitMapping || !firstSettings || !secondSettings) {
            return [];
        }

        return unitMapping.filter((item) => isDefined(item.from) && isNotDefined(item.to))
            .map((item) => {
                const property = getProperty(
                    firstSettings.pointer,
                    firstSettings.geoJson.features[item.from],
                );
                return {
                    from: item.from,
                    name: property.name,
                    code: property.code,
                    feature: firstSettings.geoJson.features[item.from],
                };
            })
            .filter((item) => caseInsensitiveSubmatch(item.name, deletedSearchText));
    }, [deletedSearchText, unitMapping]);

    const added = useMemo(() => {
        if (!unitMapping || !firstSettings || !secondSettings) {
            return [];
        }

        return unitMapping.filter((item) => isNotDefined(item.from) && isDefined(item.to))
            .map((item) => {
                const property = getProperty(
                    secondSettings.pointer,
                    secondSettings.geoJson.features[item.to],
                );
                return {
                    to: item.to,
                    name: property.name,
                    code: property.code,
                    feature: secondSettings.geoJson.features[item.to],
                };
            })
            .filter((item) => caseInsensitiveSubmatch(item.name, addedSearchText));
    }, [unitMapping, addedSearchText]);

    if (!unitMapping || !firstSettings || !secondSettings) {
        return null;
    }

    return (
        <div className={_cs(styles.links, className)}>
            <SegmentInput
                className={styles.tabs}
                options={tabOptions}
                optionKeySelector={keySelector}
                optionLabelSelector={titleSelector}
                value={currentTab}
                onChange={setCurrentTab}
            />
            {currentTab === 'unlinked' && (
                <>
                    {(added.length === 0 && deleted.length === 0) ? (
                        <div className={styles.noMapping}>
                            Hurrah!! There are no unlinked geo areas in this admin level!!
                        </div>
                    ) : (
                        <div className={styles.unlinkedContent}>
                            <div className={styles.block}>
                                <div className={styles.header}>
                                    <h2>{firstSet.title}</h2>
                                    <TextInput
                                        className={styles.textInput}
                                        placeholder="Search"
                                        value={deletedSearchText}
                                        onChange={setDeletedSearchText}
                                    />
                                </div>
                                <div className={styles.blockContent}>
                                    {deleted.map((item) => (
                                        <DeletedItem
                                            key={item.from}
                                            code={item.code}
                                            from={item.from}
                                            name={item.name}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className={styles.block}>
                                <div className={styles.header}>
                                    <h2>{secondSet.title}</h2>
                                    <TextInput
                                        className={styles.textInput}
                                        placeholder="Search"
                                        value={addedSearchText}
                                        onChange={setAddedSearchText}
                                    />
                                </div>
                                <div className={styles.blockContent}>
                                    {added.map((item) => (
                                        <AddedItem
                                            className={_cs(styles.addedItem, styles.item)}
                                            key={item.to}
                                            to={item.to}
                                            code={item.code}
                                            name={item.name}
                                            feature={item.feature}
                                            pointer={firstSettings.pointer}
                                            deletedAreas={deleted}
                                            onAreasLink={handleAreasLink}
                                            onAreasUnlink={handleAreasUnlink}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
            {currentTab === 'linked' && (
                <div className={styles.linkedContent}>
                    <div className={styles.block}>
                        <div className={styles.header}>
                            <h2>Linked</h2>
                            <TextInput
                                className={styles.textInput}
                                placeholder="Search"
                                value={linkedSearchText}
                                onChange={setLinkedSearchText}
                            />
                        </div>
                        <div className={styles.blockContent}>
                            {linked.map((item) => (
                                <AddedItem
                                    className={_cs(styles.addedItem, styles.item)}
                                    key={item.to}
                                    to={item.to}
                                    from={item.from}
                                    fromCode={item.fromCode}
                                    fromName={item.fromName}
                                    fromFeature={item.fromFeature}
                                    code={item.toCode}
                                    name={item.toName}
                                    feature={item.toFeature}
                                    deletedAreas={deleted}
                                    onAreasLink={handleAreasLink}
                                    onAreasUnlink={handleAreasUnlink}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LinkListing;
