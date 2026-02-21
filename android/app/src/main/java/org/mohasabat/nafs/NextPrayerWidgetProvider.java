package org.mohasabat.nafs;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;

public class NextPrayerWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int widgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, widgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager manager, int widgetId) {
        MohasbatWidgetProvider.WidgetSnapshot snapshot = MohasbatWidgetProvider.getSnapshot(context);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_next_prayer);

        views.setTextViewText(R.id.widget_next_prayer_name, snapshot.nextPrayerName);
        views.setTextViewText(R.id.widget_next_prayer_countdown, snapshot.nextPrayerCountdown);
        views.setTextViewText(R.id.widget_next_prayer_time, snapshot.nextPrayerTime);

        PendingIntent openIntent = MohasbatWidgetProvider.buildOpenAppPendingIntent(
            context,
            "next_prayer_root_" + widgetId,
            null
        );
        views.setOnClickPendingIntent(R.id.widget_next_prayer_root, openIntent);

        PendingIntent prayerDoneIntent = MohasbatWidgetProvider.buildQuickActionPendingIntent(
            context,
            MohasbatWidgetProvider.QUICK_ACTION_PRAYER,
            2100 + widgetId
        );
        views.setOnClickPendingIntent(R.id.widget_next_prayer_mark_done, prayerDoneIntent);

        PendingIntent adhkarIntent = MohasbatWidgetProvider.buildQuickActionPendingIntent(
            context,
            MohasbatWidgetProvider.QUICK_ACTION_ADHKAR,
            2200 + widgetId
        );
        views.setOnClickPendingIntent(R.id.widget_next_prayer_open_adhkar, adhkarIntent);

        manager.updateAppWidget(widgetId, views);
    }
}
