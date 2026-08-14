import { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
    primary: '#0F766E',
    secondary: '#14B8A6',
    accent: '#22C55E',
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    muted: '#64748B',
};

const recentIdentifications = [
    {
        id: '1',
        image:
            'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800',
        commonName: 'Sri Lankan Junglefowl',
        scientificName: 'Gallus lafayettii',
        confidence: 96,
    },
    {
        id: '2',
        image:
            'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800',
        commonName: 'Ceylon Cinnamon',
        scientificName: 'Cinnamomum verum',
        confidence: 93,
    },
    {
        id: '3',
        image:
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
        commonName: 'Asian Elephant',
        scientificName: 'Elephas maximus',
        confidence: 98,
    },
];

export default function UserDashboard() {
    const router = useRouter();
    const [recentData] = useState(recentIdentifications);
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]}
                showsVerticalScrollIndicator={false}
            >

                {/* =========================
                    HEADER
                ========================= */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>
                            Welcome back 👋
                        </Text>

                        <Text style={styles.title}>
                            WildLens
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.avatar}
                        onPress={() => router.push('/profile')}
                    >
                        <Ionicons
                            name="person-outline"
                            size={23}
                            color={COLORS.card}
                        />
                    </TouchableOpacity>
                </View>

                {/* =========================
                    HERO
                ========================= */}
                <View style={styles.hero}>
                    <View style={styles.heroIcon}>
                        <Ionicons
                            name="scan-outline"
                            size={30}
                            color={COLORS.card}
                        />
                    </View>

                    <Text style={styles.heroTitle}>
                        AI Powered Image Identifier
                    </Text>

                    <Text style={styles.heroSubtitle}>
                        Discover the wildlife around you
                    </Text>

                    <Text style={styles.heroText}>
                        Capture or upload an image and let AI instantly
                        identify plants, animals, insects, birds,
                        landmarks and more.
                    </Text>

                    <View style={styles.heroButtons}>
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={() => router.push('/camera')}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="camera"
                                size={21}
                                color={COLORS.card}
                            />

                            <Text style={styles.primaryBtnText}>
                                Capture
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            onPress={() => router.push('/upload')}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="cloud-upload-outline"
                                size={21}
                                color={COLORS.primary}
                            />

                            <Text style={styles.secondaryBtnText}>
                                Upload
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* =========================
                    QUICK ACTIONS
                ========================= */}
                <View style={styles.grid}>
                    <Action
                        title="Capture"
                        subtitle="Take a photo"
                        icon="camera-outline"
                        onPress={() => router.push('/camera')}
                    />

                    <Action
                        title="Upload"
                        subtitle="Choose an image"
                        icon="cloud-upload-outline"
                        onPress={() => router.push('/upload')}
                    />

                    <Action
                        title="History"
                        subtitle="Previous scans"
                        icon="time-outline"
                        onPress={() => router.push('/history')}
                    />

                    <Action
                        title="Explore"
                        subtitle="Discover wildlife"
                        icon="compass-outline"
                        onPress={() => router.push('/explore')}
                    />
                </View>

                {/* =========================
                    RECENT IDENTIFICATIONS
                ========================= */}
                <Section
                    title="Recent Identifications"
                    action="View All"
                    onPress={() => router.push('/history')}
                />

                <FlatList
                    horizontal
                    data={recentData}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.identifyCard}
                            activeOpacity={0.85}
                        >
                            <Image
                                source={{ uri: item.image }}
                                style={styles.identifyImage}
                                contentFit="cover"
                            />

                            <Text
                                style={styles.identifyName}
                                numberOfLines={1}
                            >
                                {item.commonName}
                            </Text>

                            <Text
                                style={styles.identifyScientific}
                                numberOfLines={1}
                            >
                                {item.scientificName}
                            </Text>

                            <View style={styles.confidenceBadge}>
                                <Ionicons
                                    name="checkmark-circle"
                                    size={13}
                                    color="#15803D"
                                />

                                <Text style={styles.confidenceText}>
                                    {item.confidence}% Match
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />

                {/* =========================
                    AI INSIGHTS
                ========================= */}
                <Section title="AI Insights" />

                <View style={styles.statsContainer}>
                    <StatCard
                        number="482"
                        label="Identified"
                        icon="scan-outline"
                    />

                    <StatCard
                        number="91%"
                        label="Accuracy"
                        icon="analytics-outline"
                    />

                    <StatCard
                        number="78"
                        label="Species"
                        icon="leaf-outline"
                    />
                </View>

                {/* =========================
                    SPECIES INFORMATION
                ========================= */}
                <View style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                        <View style={styles.infoIcon}>
                            <Ionicons
                                name="leaf"
                                size={20}
                                color={COLORS.primary}
                            />
                        </View>

                        <View style={styles.infoHeaderText}>
                            <Text style={styles.objectName}>
                                Sri Lankan Junglefowl
                            </Text>

                            <Text style={styles.scientificName}>
                                Gallus lafayettii
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.infoText}>
                        Endemic bird species found only in Sri Lanka.
                        Commonly inhabits forests and isolated woodland
                        areas.
                    </Text>

                    <View style={styles.bioGrid}>
                        <BioItem
                            label="Habitat"
                            value="Forest"
                        />

                        <BioItem
                            label="Status"
                            value="Least Concern"
                        />

                        <BioItem
                            label="Family"
                            value="Phasianidae"
                        />

                        <BioItem
                            label="Kingdom"
                            value="Animalia"
                        />
                    </View>
                </View>

                {/* =========================
                    TOURIST TOOLS
                ========================= */}
                <Section title="Tourist Tools" />

                <View style={styles.grid}>
                    <Action
                        title="Nearby Species"
                        subtitle="Find wildlife nearby"
                        icon="location-outline"
                        onPress={() => router.push('/nearby')}
                    />

                    <Action
                        title="Field Guide"
                        subtitle="Learn about species"
                        icon="book-outline"
                        onPress={() => router.push('/guide')}
                    />

                    <Action
                        title="Biodiversity Map"
                        subtitle="Explore locations"
                        icon="map-outline"
                        onPress={() => router.push('/map')}
                    />

                    <Action
                        title="Offline Guide"
                        subtitle="Use without internet"
                        icon="download-outline"
                        onPress={() => router.push('/offline')}
                    />
                </View>

            </ScrollView>
        </View>
    );
}

/* =====================================================
   ACTION CARD
===================================================== */

function Action({
    title,
    subtitle,
    icon,
    onPress,
}) {
    return (
        <TouchableOpacity
            style={styles.actionCard}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.actionIconContainer}>
                <Ionicons
                    name={icon}
                    size={24}
                    color={COLORS.primary}
                />
            </View>

            <Text style={styles.actionText}>
                {title}
            </Text>

            <Text style={styles.actionSubtitle}>
                {subtitle}
            </Text>
        </TouchableOpacity>
    );
}

/* =====================================================
   SECTION HEADER
===================================================== */

function Section({
    title,
    action,
    onPress,
}) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>
                {title}
            </Text>

            {action && (
                <TouchableOpacity
                    onPress={onPress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.sectionAction}>
                        {action}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
    number,
    label,
    icon,
}) {
    return (
        <View style={styles.statCard}>
            <View style={styles.statIcon}>
                <Ionicons
                    name={icon}
                    size={18}
                    color={COLORS.primary}
                />
            </View>

            <Text style={styles.statNumber}>
                {number}
            </Text>

            <Text style={styles.statLabel}>
                {label}
            </Text>
        </View>
    );
}

/* =====================================================
   BIO ITEM
===================================================== */

function BioItem({
    label,
    value,
}) {
    return (
        <View style={styles.bioItem}>
            <Text style={styles.bioLabel}>
                {label}
            </Text>

            <Text style={styles.bioValue}>
                {value}
            </Text>
        </View>
    );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    scroll: {
        flex: 1,
    },

    content: {
        padding: 18,
        paddingBottom: 40,
    },

    /* =========================
       HEADER
    ========================= */

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },

    greeting: {
        color: COLORS.muted,
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 3,
    },

    title: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.text,
    },

    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.2,
        shadowRadius: 7,
        shadowOffset: {
            width: 0,
            height: 4,
        },
    },

    /* =========================
       HERO
    ========================= */

    hero: {
        backgroundColor: COLORS.primary,
        padding: 22,
        borderRadius: 24,
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: {
            width: 0,
            height: 6,
        },
    },

    heroIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },

    heroTitle: {
        color: COLORS.card,
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 5,
    },

    heroSubtitle: {
        color: '#CCFBF1',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 12,
    },

    heroText: {
        color: '#E6FFFB',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 20,
    },

    heroButtons: {
        flexDirection: 'row',
        gap: 10,
    },

    primaryBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.accent,
        paddingVertical: 13,
        borderRadius: 13,
        gap: 7,
    },

    primaryBtnText: {
        color: COLORS.card,
        fontSize: 14,
        fontWeight: '900',
    },

    secondaryBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.card,
        paddingVertical: 13,
        borderRadius: 13,
        gap: 7,
    },

    secondaryBtnText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '900',
    },

    /* =========================
       GRID
    ========================= */

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    actionCard: {
        width: '48%',
        backgroundColor: COLORS.card,
        padding: 16,
        borderRadius: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#0F172A',
        shadowOpacity: 0.05,
        shadowRadius: 7,
        shadowOffset: {
            width: 0,
            height: 3,
        },
    },

    actionIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 13,
        backgroundColor: '#CCFBF1',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 11,
    },

    actionText: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: '900',
        marginBottom: 4,
    },

    actionSubtitle: {
        color: COLORS.muted,
        fontSize: 11,
        lineHeight: 16,
    },

    /* =========================
       SECTION
    ========================= */

    section: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 7,
        marginBottom: 13,
    },

    sectionTitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: '900',
    },

    sectionAction: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '900',
    },

    /* =========================
       HORIZONTAL LIST
    ========================= */

    horizontalList: {
        paddingBottom: 5,
    },

    identifyCard: {
        width: 175,
        backgroundColor: COLORS.card,
        padding: 11,
        borderRadius: 18,
        marginRight: 13,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
    },

    identifyImage: {
        width: '100%',
        height: 125,
        borderRadius: 13,
        marginBottom: 10,
        backgroundColor: '#E2E8F0',
    },

    identifyName: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '900',
        marginBottom: 3,
    },

    identifyScientific: {
        color: COLORS.muted,
        fontSize: 11,
        fontStyle: 'italic',
        marginBottom: 9,
    },

    confidenceBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 4,
    },

    confidenceText: {
        color: '#15803D',
        fontSize: 10,
        fontWeight: '900',
    },

    /* =========================
       STATISTICS
    ========================= */

    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },

    statCard: {
        width: '31.5%',
        backgroundColor: COLORS.card,
        paddingVertical: 15,
        alignItems: 'center',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
    },

    statIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#CCFBF1',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 7,
    },

    statNumber: {
        color: COLORS.primary,
        fontSize: 21,
        fontWeight: '900',
    },

    statLabel: {
        color: COLORS.muted,
        fontSize: 11,
        fontWeight: '700',
        marginTop: 2,
    },

    /* =========================
       INFO CARD
    ========================= */

    infoCard: {
        backgroundColor: COLORS.card,
        padding: 18,
        borderRadius: 20,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderLeftWidth: 4,
        borderLeftColor: COLORS.secondary,
        elevation: 2,
    },

    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 13,
    },

    infoIcon: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: '#CCFBF1',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11,
    },

    infoHeaderText: {
        flex: 1,
    },

    objectName: {
        color: COLORS.text,
        fontSize: 17,
        fontWeight: '900',
        marginBottom: 3,
    },

    scientificName: {
        color: COLORS.primary,
        fontSize: 12,
        fontStyle: 'italic',
        fontWeight: '700',
    },

    infoText: {
        color: COLORS.muted,
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 16,
    },

    /* =========================
       BIODIVERSITY
    ========================= */

    bioGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 14,
    },

    bioItem: {
        width: '50%',
        marginBottom: 12,
    },

    bioLabel: {
        color: COLORS.muted,
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 3,
    },

    bioValue: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: '800',
    },
});
