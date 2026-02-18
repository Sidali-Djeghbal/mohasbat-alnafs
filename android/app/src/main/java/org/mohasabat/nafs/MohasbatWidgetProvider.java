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
import java.util.Date;
import java.util.Locale;

public class MohasbatWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_QUICK_ADD = "org.mohasabat.nafs.action.QUICK_ADD";
    public static final String ACTION_REFRESH_WIDGET = "org.mohasabat.nafs.action.REFRESH_WIDGET";
    public static final String EXTRA_QUICK_ACTION = "quick_action";

    private static final String QUICK_ACTION_PRAYER = "prayer";
    private static final String QUICK_ACTION_QURAN = "quran";
    private static final String QUICK_ACTION_ADHKAR = "adhkar";

    private static final String PREFS_NAME = "mohasbat_widget_state";
    private static final String KEY_SCORE = "today_score";
    private static final String KEY_PENDING = "pending_count";
    private static final String KEY_DATE = "date_key";
    private static final String KEY_PENDING_QUICK_ACTION = "pending_quick_action";

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
                applyQuickAction(context, quickAction);
                launchApp(context, quickAction);
                updateAllWidgets(context);
            }
            return;
        }

        if (ACTION_REFRESH_WIDGET.equals(intentAction)) {
            updateAllWidgets(context);
        }
    }

    public static void updateWidgetState(Context context, int score, int pendingCount) {
        SharedPreferences prefs = getPrefs(context);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(KEY_DATE, getTodayKey());
        editor.putInt(KEY_SCORE, clamp(score, 0, 100));
        editor.putInt(KEY_PENDING, Math.max(0, pendingCount));
        editor.apply();
        updateAllWidgets(context);
    }

    public static String getPendingQuickAction(Context context) {
        return getPrefs(context).getString(KEY_PENDING_QUICK_ACTION, null);
    }

    public static void setPendingQuickAction(Context context, String action) {
        SharedPreferences.Editor editor = getPrefs(context).edit();
        editor.putString(KEY_PENDING_QUICK_ACTION, action);
        editor.apply();
    }

    public static void clearPendingQuickAction(Context context) {
        SharedPreferences.Editor editor = getPrefs(context).edit();
        editor.remove(KEY_PENDING_QUICK_ACTION);
        editor.apply();
    }

    private static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName widgetComponent = new ComponentName(context, MohasbatWidgetProvider.class);
        int[] widgetIds = manager.getAppWidgetIds(widgetComponent);

        for (int widgetId : widgetIds) {
            updateAppWidget(context, manager, widgetId);
        }
    }

    private static void updateAppWidget(Context context, AppWidgetManager manager, int widgetId) {
        ensureTodayState(context);
        SharedPreferences prefs = getPrefs(context);
        int score = prefs.getInt(KEY_SCORE, 0);
        int pending = prefs.getInt(KEY_PENDING, 0);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_mohasbat);
        views.setTextViewText(R.id.widget_score_value, score + "%");
        views.setTextViewText(R.id.widget_pending_value, String.valueOf(pending));

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

    private static PendingIntent buildQuickActionPendingIntent(Context context, String action, int requestCode) {
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

    private static PendingIntent buildOpenAppPendingIntent(Context context, String token, String action) {
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

    private static void launchApp(Context context, String quickAction) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        intent.putExtra(EXTRA_QUICK_ACTION, quickAction);
        context.startActivity(intent);
    }

    private static void applyQuickAction(Context context, String quickAction) {
        ensureTodayState(context);
        SharedPreferences prefs = getPrefs(context);

        int score = prefs.getInt(KEY_SCORE, 0);
        int pending = prefs.getInt(KEY_PENDING, 0);

        // Lightweight optimistic update; the web app will sync the exact values next.
        score = clamp(score + 5, 0, 100);
        pending = Math.max(0, pending - 1);

        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(KEY_PENDING_QUICK_ACTION, quickAction);
        editor.putInt(KEY_SCORE, score);
        editor.putInt(KEY_PENDING, pending);
        editor.putString(KEY_DATE, getTodayKey());
        editor.apply();
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
            editor.remove(KEY_PENDING_QUICK_ACTION);
            editor.apply();
        }
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
}
