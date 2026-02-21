package org.mohasabat.nafs;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.util.TypedValue;
import android.widget.RemoteViews;

public class DailyProgressWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int widgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, widgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager manager, int widgetId) {
        MohasbatWidgetProvider.WidgetSnapshot snapshot = MohasbatWidgetProvider.getSnapshot(context);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_daily_progress);

        views.setTextViewText(R.id.widget_daily_progress_value, snapshot.score + "%");
        views.setTextViewText(
            R.id.widget_daily_progress_pending,
            context.getString(R.string.widget_progress_pending, snapshot.pending)
        );
        views.setImageViewBitmap(R.id.widget_daily_progress_ring, createProgressRing(context, snapshot.score));

        PendingIntent openIntent = MohasbatWidgetProvider.buildOpenAppPendingIntent(
            context,
            "daily_progress_root_" + widgetId,
            null
        );
        views.setOnClickPendingIntent(R.id.widget_daily_progress_root, openIntent);
        views.setOnClickPendingIntent(R.id.widget_daily_progress_open_btn, openIntent);

        PendingIntent quickPrayerIntent = MohasbatWidgetProvider.buildQuickActionPendingIntent(
            context,
            MohasbatWidgetProvider.QUICK_ACTION_PRAYER,
            3100 + widgetId
        );
        views.setOnClickPendingIntent(R.id.widget_daily_progress_prayer_btn, quickPrayerIntent);

        PendingIntent quickQuranIntent = MohasbatWidgetProvider.buildQuickActionPendingIntent(
            context,
            MohasbatWidgetProvider.QUICK_ACTION_QURAN,
            3200 + widgetId
        );
        views.setOnClickPendingIntent(R.id.widget_daily_progress_quran_btn, quickQuranIntent);

        manager.updateAppWidget(widgetId, views);
    }

    private static Bitmap createProgressRing(Context context, int progress) {
        int safeProgress = Math.max(0, Math.min(progress, 100));
        int sizePx = dpToPx(context, 96);
        int strokePx = dpToPx(context, 10);
        int paddingPx = dpToPx(context, 6);

        Bitmap bitmap = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);

        RectF oval = new RectF(
            paddingPx,
            paddingPx,
            sizePx - paddingPx,
            sizePx - paddingPx
        );

        Paint trackPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        trackPaint.setStyle(Paint.Style.STROKE);
        trackPaint.setStrokeWidth(strokePx);
        trackPaint.setStrokeCap(Paint.Cap.ROUND);
        trackPaint.setColor(Color.parseColor("#334155"));

        Paint progressPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        progressPaint.setStyle(Paint.Style.STROKE);
        progressPaint.setStrokeWidth(strokePx);
        progressPaint.setStrokeCap(Paint.Cap.ROUND);
        progressPaint.setColor(Color.parseColor("#22C55E"));

        canvas.drawArc(oval, -90f, 360f, false, trackPaint);
        canvas.drawArc(oval, -90f, 3.6f * safeProgress, false, progressPaint);

        return bitmap;
    }

    private static int dpToPx(Context context, int dp) {
        return (int) TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            dp,
            context.getResources().getDisplayMetrics()
        );
    }
}
