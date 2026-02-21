package org.mohasabat.nafs;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import org.json.JSONArray;
import org.json.JSONException;

public class MohasbatWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_QUICK_ADD = "org.mohasabat.nafs.action.QUICK_ADD";
    public static final String ACTION_REFRESH_WIDGET = "org.mohasabat.nafs.action.REFRESH_WIDGET";
    public static final String EXTRA_QUICK_ACTION = "quick_action";

    public static final String QUICK_ACTION_PRAYER = "prayer";
    public static final String QUICK_ACTION_QURAN = "quran";
    public static final String QUICK_ACTION_ADHKAR = "adhkar";
    public static final String QUICK_ACTION_ADHKAR_RESET = "adhkar_reset";
    public static final String QUICK_ACTION_ADHKAR_STEP_1 = "adhkar_step_1";
    public static final String QUICK_ACTION_ADHKAR_STEP_2 = "adhkar_step_2";
    public static final String QUICK_ACTION_ADHKAR_STEP_3 = "adhkar_step_3";

    private static final String PREFS_NAME = "mohasbat_widget_state";
    private static final String KEY_SCORE = "today_score";
    private static final String KEY_PENDING = "pending_count";
    private static final String KEY_NEXT_PRAYER_NAME = "next_prayer_name";
    private static final String KEY_NEXT_PRAYER_COUNTDOWN = "next_prayer_countdown";
    private static final String KEY_NEXT_PRAYER_TIME = "next_prayer_time";
    private static final String KEY_ADHKAR_PHASE = "adhkar_phase";
    private static final String KEY_ADHKAR_COMPLETED = "adhkar_completed";
    private static final String KEY_ADHKAR_STEP_FLAGS = "adhkar_step_flags";
    private static final String KEY_DATE = "date_key";
    private static final String KEY_PENDING_QUICK_ACTIONS = "pending_quick_actions";
    private static final String KEY_PENDING_QUICK_ACTION = "pending_quick_action";
    private static final int ADHKAR_STEP_COUNT = 3;
    private static final int ADHKAR_ALL_STEPS_MASK = (1 << ADHKAR_STEP_COUNT) - 1;

    static final class WidgetSnapshot {
        final int score;
        final int pending;
        final String nextPrayerName;
        final String nextPrayerCountdown;
        final String nextPrayerTime;
        final String adhkarPhase;
        final boolean adhkarCompleted;
        final int adhkarStepFlags;

        WidgetSnapshot(
            int score,
            int pending,
            String nextPrayerName,
            String nextPrayerCountdown,
            String nextPrayerTime,
            String adhkarPhase,
            boolean adhkarCompleted,
            int adhkarStepFlags
        ) {
            this.score = score;
            this.pending = pending;
            this.nextPrayerName = nextPrayerName;
            this.nextPrayerCountdown = nextPrayerCountdown;
            this.nextPrayerTime = nextPrayerTime;
            this.adhkarPhase = adhkarPhase;
            this.adhkarCompleted = adhkarCompleted;
            this.adhkarStepFlags = adhkarStepFlags;
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int widgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, widgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);

        if (intent == null || intent.getAction() == null) {
            return;
        }

        String intentAction = intent.getAction();
        if (ACTION_QUICK_ADD.equals(intentAction)) {
            String quickAction = intent.getStringExtra(EXTRA_QUICK_ACTION);
            if (quickAction != null && !quickAction.isEmpty()) {
                boolean changed = applyQuickAction(context, quickAction);
                if (changed) {
                    updateAllWidgets(context);
                }
            }
            return;
        }

        if (ACTION_REFRESH_WIDGET.equals(intentAction)) {
            updateAllWidgets(context);
        }
    }

    public static void updateWidgetState(
        Context context,
        int score,
        int pendingCount,
        String nextPrayerName,
        String nextPrayerCountdown,
        String nextPrayerTime,
        String adhkarPhase,
        boolean adhkarCompleted
    ) {
        SharedPreferences prefs = getPrefs(context);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(KEY_DATE, getTodayKey());
        editor.putInt(KEY_SCORE, clamp(score, 0, 100));
        editor.putInt(KEY_PENDING, Math.max(0, pendingCount));
        editor.putString(KEY_NEXT_PRAYER_NAME, safeText(nextPrayerName, "الصلاة القادمة"));
        editor.putString(KEY_NEXT_PRAYER_COUNTDOWN, safeText(nextPrayerCountdown, "--:--"));
        editor.putString(KEY_NEXT_PRAYER_TIME, safeText(nextPrayerTime, "--:--"));
        editor.putString(KEY_ADHKAR_PHASE, safeText(adhkarPhase, "أذكار اليوم"));
        editor.putBoolean(KEY_ADHKAR_COMPLETED, adhkarCompleted);
        editor.putInt(KEY_ADHKAR_STEP_FLAGS, adhkarCompleted ? ADHKAR_ALL_STEPS_MASK : 0);
        editor.apply();
        updateAllWidgets(context);
    }

    public static String getPendingQuickAction(Context context) {
        String[] actions = getPendingQuickActions(context);
        if (actions.length == 0) {
            return null;
        }
        return actions[0];
    }

    public static String[] getPendingQuickActions(Context context) {
        List<String> actions = readPendingActions(context);
        return actions.toArray(new String[0]);
    }

    public static void enqueuePendingQuickAction(Context context, String action) {
        if (action == null || action.trim().isEmpty()) {
            return;
        }
        List<String> actions = readPendingActions(context);
        actions.add(action);
        writePendingActions(context, actions);
    }

    public static void setPendingQuickAction(Context context, String action) {
        enqueuePendingQuickAction(context, action);
    }

    public static void clearPendingQuickAction(Context context) {
        List<String> actions = readPendingActions(context);
        if (!actions.isEmpty()) {
            actions.remove(0);
        }
        writePendingActions(context, actions);
    }

    public static void clearPendingQuickActions(Context context) {
        writePendingActions(context, new ArrayList<String>());
    }

    static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        updateWidgetClass(context, manager, MohasbatWidgetProvider.class);
        updateWidgetClass(context, manager, NextPrayerWidgetProvider.class);
        updateWidgetClass(context, manager, DailyProgressWidgetProvider.class);
        updateWidgetClass(context, manager, AdhkarQuickWidgetProvider.class);
    }

    private static void updateWidgetClass(
        Context context,
        AppWidgetManager manager,
        Class<? extends AppWidgetProvider> providerClass
    ) {
        ComponentName widgetComponent = new ComponentName(context, providerClass);
        int[] widgetIds = manager.getAppWidgetIds(widgetComponent);

        for (int widgetId : widgetIds) {
            if (providerClass == MohasbatWidgetProvider.class) {
                updateAppWidget(context, manager, widgetId);
            } else if (providerClass == NextPrayerWidgetProvider.class) {
                NextPrayerWidgetProvider.updateAppWidget(context, manager, widgetId);
            } else if (providerClass == DailyProgressWidgetProvider.class) {
                DailyProgressWidgetProvider.updateAppWidget(context, manager, widgetId);
            } else if (providerClass == AdhkarQuickWidgetProvider.class) {
                AdhkarQuickWidgetProvider.updateAppWidget(context, manager, widgetId);
            }
        }
    }

    static WidgetSnapshot getSnapshot(Context context) {
        ensureTodayState(context);
        SharedPreferences prefs = getPrefs(context);

        return new WidgetSnapshot(
            prefs.getInt(KEY_SCORE, 0),
            prefs.getInt(KEY_PENDING, 0),
            prefs.getString(KEY_NEXT_PRAYER_NAME, "الصلاة القادمة"),
            prefs.getString(KEY_NEXT_PRAYER_COUNTDOWN, "--:--"),
            prefs.getString(KEY_NEXT_PRAYER_TIME, "--:--"),
            prefs.getString(KEY_ADHKAR_PHASE, "أذكار اليوم"),
            prefs.getBoolean(KEY_ADHKAR_COMPLETED, false),
            clamp(prefs.getInt(KEY_ADHKAR_STEP_FLAGS, 0), 0, ADHKAR_ALL_STEPS_MASK)
        );
    }

    static int getAdhkarStepCount() {
        return ADHKAR_STEP_COUNT;
    }

    static int getAdhkarStepsDone(int flags) {
        int safeFlags = clamp(flags, 0, ADHKAR_ALL_STEPS_MASK);
        return Integer.bitCount(safeFlags);
    }

    static boolean isAdhkarStepDone(int flags, int stepIndex) {
        if (stepIndex < 1 || stepIndex > ADHKAR_STEP_COUNT) {
            return false;
        }
        int safeFlags = clamp(flags, 0, ADHKAR_ALL_STEPS_MASK);
        return (safeFlags & (1 << (stepIndex - 1))) != 0;
    }

    static void updateAppWidget(Context context, AppWidgetManager manager, int widgetId) {
        WidgetSnapshot snapshot = getSnapshot(context);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_mohasbat);
        views.setTextViewText(R.id.widget_score_value, snapshot.score + "%");
        views.setTextViewText(R.id.widget_pending_value, String.valueOf(snapshot.pending));

        views.setOnClickPendingIntent(
            R.id.widget_root,
            buildOpenAppPendingIntent(context, "open", null)
        );

        views.setOnClickPendingIntent(
            R.id.widget_quick_prayer,
            buildQuickActionPendingIntent(context, QUICK_ACTION_PRAYER, 101)
        );
        views.setOnClickPendingIntent(
            R.id.widget_quick_quran,
            buildQuickActionPendingIntent(context, QUICK_ACTION_QURAN, 102)
        );
        views.setOnClickPendingIntent(
            R.id.widget_quick_adhkar,
            buildQuickActionPendingIntent(context, QUICK_ACTION_ADHKAR, 103)
        );

        manager.updateAppWidget(widgetId, views);
    }

    static PendingIntent buildQuickActionPendingIntent(Context context, String action, int requestCode) {
        Intent intent = new Intent(context, MohasbatWidgetProvider.class);
        intent.setAction(ACTION_QUICK_ADD);
        intent.putExtra(EXTRA_QUICK_ACTION, action);

        return PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    static PendingIntent buildOpenAppPendingIntent(Context context, String token, String action) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        if (action != null) {
            intent.putExtra(EXTRA_QUICK_ACTION, action);
        }

        return PendingIntent.getActivity(
            context,
            ("open_" + token).hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private static boolean applyQuickAction(Context context, String quickAction) {
        ensureTodayState(context);
        SharedPreferences prefs = getPrefs(context);

        int score = prefs.getInt(KEY_SCORE, 0);
        int pending = prefs.getInt(KEY_PENDING, 0);
        boolean adhkarCompleted = prefs.getBoolean(KEY_ADHKAR_COMPLETED, false);
        int adhkarStepFlags = clamp(prefs.getInt(KEY_ADHKAR_STEP_FLAGS, 0), 0, ADHKAR_ALL_STEPS_MASK);
        boolean changed = false;
        String queuedAction = null;

        if (QUICK_ACTION_PRAYER.equals(quickAction) || QUICK_ACTION_QURAN.equals(quickAction)) {
            score = clamp(score + 5, 0, 100);
            pending = Math.max(0, pending - 1);
            queuedAction = quickAction;
            changed = true;
        } else if (QUICK_ACTION_ADHKAR.equals(quickAction)) {
            if (!adhkarCompleted || adhkarStepFlags != ADHKAR_ALL_STEPS_MASK) {
                adhkarCompleted = true;
                adhkarStepFlags = ADHKAR_ALL_STEPS_MASK;
                score = clamp(score + 5, 0, 100);
                pending = Math.max(0, pending - 1);
                queuedAction = QUICK_ACTION_ADHKAR;
                changed = true;
            }
        } else if (QUICK_ACTION_ADHKAR_RESET.equals(quickAction)) {
            if (adhkarCompleted || adhkarStepFlags != 0) {
                adhkarCompleted = false;
                adhkarStepFlags = 0;
                queuedAction = QUICK_ACTION_ADHKAR_RESET;
                changed = true;
            }
        } else {
            int stepIndex = parseAdhkarStepIndex(quickAction);
            if (stepIndex >= 0 && !adhkarCompleted) {
                int stepMask = 1 << stepIndex;
                if ((adhkarStepFlags & stepMask) == 0) {
                    adhkarStepFlags |= stepMask;
                    changed = true;

                    if (adhkarStepFlags == ADHKAR_ALL_STEPS_MASK) {
                        adhkarCompleted = true;
                        score = clamp(score + 5, 0, 100);
                        pending = Math.max(0, pending - 1);
                        queuedAction = QUICK_ACTION_ADHKAR;
                    }
                }
            }
        }

        if (!changed) {
            return false;
        }

        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(KEY_DATE, getTodayKey());
        editor.putInt(KEY_SCORE, score);
        editor.putInt(KEY_PENDING, pending);
        editor.putBoolean(KEY_ADHKAR_COMPLETED, adhkarCompleted);
        editor.putInt(KEY_ADHKAR_STEP_FLAGS, adhkarStepFlags);
        editor.apply();

        if (queuedAction != null) {
            enqueuePendingQuickAction(context, queuedAction);
        }

        return true;
    }

    private static void ensureTodayState(Context context) {
        SharedPreferences prefs = getPrefs(context);
        String today = getTodayKey();
        String savedDate = prefs.getString(KEY_DATE, null);

        if (!today.equals(savedDate)) {
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString(KEY_DATE, today);
            editor.putInt(KEY_SCORE, 0);
            editor.putInt(KEY_PENDING, 0);
            editor.putString(KEY_NEXT_PRAYER_NAME, "الصلاة القادمة");
            editor.putString(KEY_NEXT_PRAYER_COUNTDOWN, "--:--");
            editor.putString(KEY_NEXT_PRAYER_TIME, "--:--");
            editor.putString(KEY_ADHKAR_PHASE, "أذكار اليوم");
            editor.putBoolean(KEY_ADHKAR_COMPLETED, false);
            editor.putInt(KEY_ADHKAR_STEP_FLAGS, 0);
            editor.remove(KEY_PENDING_QUICK_ACTIONS);
            editor.remove(KEY_PENDING_QUICK_ACTION);
            editor.apply();
        }
    }

    private static List<String> readPendingActions(Context context) {
        SharedPreferences prefs = getPrefs(context);
        List<String> actions = new ArrayList<>();
        String rawQueue = prefs.getString(KEY_PENDING_QUICK_ACTIONS, null);

        if (rawQueue != null && !rawQueue.trim().isEmpty()) {
            try {
                JSONArray array = new JSONArray(rawQueue);
                for (int i = 0; i < array.length(); i++) {
                    String action = safeText(array.optString(i, ""), "");
                    if (!action.isEmpty()) {
                        actions.add(action);
                    }
                }
            } catch (JSONException ignored) {
            }
        }

        if (actions.isEmpty()) {
            String legacy = prefs.getString(KEY_PENDING_QUICK_ACTION, null);
            if (legacy != null && !legacy.trim().isEmpty()) {
                actions.add(legacy.trim());
            }
        }

        return actions;
    }

    private static void writePendingActions(Context context, List<String> actions) {
        SharedPreferences.Editor editor = getPrefs(context).edit();
        JSONArray array = new JSONArray();

        if (actions != null) {
            for (String action : actions) {
                String safeAction = safeText(action, "");
                if (!safeAction.isEmpty()) {
                    array.put(safeAction);
                }
            }
        }

        if (array.length() == 0) {
            editor.remove(KEY_PENDING_QUICK_ACTIONS);
            editor.remove(KEY_PENDING_QUICK_ACTION);
        } else {
            editor.putString(KEY_PENDING_QUICK_ACTIONS, array.toString());
            editor.putString(KEY_PENDING_QUICK_ACTION, array.optString(0, ""));
        }

        editor.apply();
    }

    private static int parseAdhkarStepIndex(String action) {
        if (QUICK_ACTION_ADHKAR_STEP_1.equals(action)) {
            return 0;
        }
        if (QUICK_ACTION_ADHKAR_STEP_2.equals(action)) {
            return 1;
        }
        if (QUICK_ACTION_ADHKAR_STEP_3.equals(action)) {
            return 2;
        }
        return -1;
    }

    private static SharedPreferences getPrefs(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    private static String getTodayKey() {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-M-d", Locale.US);
        return format.format(new Date());
    }

    private static int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private static String safeText(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) {
            return fallback;
        }
        return value.trim();
    }
}
