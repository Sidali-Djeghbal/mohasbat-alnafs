package org.mohasabat.nafs;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;

public class AdhkarQuickWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int widgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, widgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager manager, int widgetId) {
        MohasbatWidgetProvider.WidgetSnapshot snapshot = MohasbatWidgetProvider.getSnapshot(context);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_adhkar_quick);
        int stepsDone = MohasbatWidgetProvider.getAdhkarStepsDone(snapshot.adhkarStepFlags);
        int totalSteps = MohasbatWidgetProvider.getAdhkarStepCount();

        views.setTextViewText(R.id.widget_adhkar_phase_value, snapshot.adhkarPhase);
        views.setTextViewText(R.id.widget_adhkar_status_value, buildStatusText(context, snapshot.adhkarCompleted, stepsDone, totalSteps));

        PendingIntent openIntent = MohasbatWidgetProvider.buildOpenAppPendingIntent(
            context,
            "adhkar_root_" + widgetId,
            null
        );
        views.setOnClickPendingIntent(R.id.widget_adhkar_root, openIntent);
        views.setOnClickPendingIntent(R.id.widget_adhkar_open_btn, openIntent);

        views.setOnClickPendingIntent(
            R.id.widget_adhkar_step_1_btn,
            MohasbatWidgetProvider.buildQuickActionPendingIntent(
                context,
                MohasbatWidgetProvider.QUICK_ACTION_ADHKAR_STEP_1,
                2300 + widgetId
            )
        );
        views.setOnClickPendingIntent(
            R.id.widget_adhkar_step_2_btn,
            MohasbatWidgetProvider.buildQuickActionPendingIntent(
                context,
                MohasbatWidgetProvider.QUICK_ACTION_ADHKAR_STEP_2,
                2400 + widgetId
            )
        );
        views.setOnClickPendingIntent(
            R.id.widget_adhkar_step_3_btn,
            MohasbatWidgetProvider.buildQuickActionPendingIntent(
                context,
                MohasbatWidgetProvider.QUICK_ACTION_ADHKAR_STEP_3,
                2500 + widgetId
            )
        );

        PendingIntent completeOrResetIntent = MohasbatWidgetProvider.buildQuickActionPendingIntent(
            context,
            snapshot.adhkarCompleted
                ? MohasbatWidgetProvider.QUICK_ACTION_ADHKAR_RESET
                : MohasbatWidgetProvider.QUICK_ACTION_ADHKAR,
            2600 + widgetId
        );
        views.setOnClickPendingIntent(R.id.widget_adhkar_complete_btn, completeOrResetIntent);

        views.setTextViewText(
            R.id.widget_adhkar_step_1_btn,
            buildStepLabel(context, R.string.widget_adhkar_step_1, MohasbatWidgetProvider.isAdhkarStepDone(snapshot.adhkarStepFlags, 1))
        );
        views.setTextViewText(
            R.id.widget_adhkar_step_2_btn,
            buildStepLabel(context, R.string.widget_adhkar_step_2, MohasbatWidgetProvider.isAdhkarStepDone(snapshot.adhkarStepFlags, 2))
        );
        views.setTextViewText(
            R.id.widget_adhkar_step_3_btn,
            buildStepLabel(context, R.string.widget_adhkar_step_3, MohasbatWidgetProvider.isAdhkarStepDone(snapshot.adhkarStepFlags, 3))
        );

        views.setTextViewText(
            R.id.widget_adhkar_complete_btn,
            snapshot.adhkarCompleted
                ? context.getString(R.string.widget_adhkar_reset)
                : context.getString(R.string.widget_adhkar_complete_all)
        );

        manager.updateAppWidget(widgetId, views);
    }

    private static String buildStatusText(Context context, boolean completed, int stepsDone, int totalSteps) {
        if (completed) {
            return context.getString(R.string.widget_adhkar_completed);
        }
        return context.getString(R.string.widget_adhkar_steps_status, stepsDone, totalSteps);
    }

    private static String buildStepLabel(Context context, int labelRes, boolean done) {
        String base = context.getString(labelRes);
        if (!done) {
            return base;
        }
        return context.getString(R.string.widget_adhkar_step_done_prefix, base);
    }
}
