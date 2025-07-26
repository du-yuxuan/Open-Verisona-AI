import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { 
  userSessions, 
  pageViews, 
  userEvents, 
  questionnaireAnalytics,
  featureUsage,
  performanceMetrics 
} from '@/lib/db/analytics-schema';
import { getUser } from '@/lib/db/queries';

// Helper function to safely convert values to integers
function safeInt(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = parseFloat(value.toString());
  if (isNaN(num) || !isFinite(num)) return null;
  return Math.max(0, Math.floor(num));
}

export async function POST(request: NextRequest) {
  try {
    const { events, sessionData, timestamp } = await request.json();
    
    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ error: 'Invalid events data' }, { status: 400 });
    }

    // Process events for analytics

    // Get current user (optional - some events may be anonymous)
    const user = await getUser();
    const userId = user?.id;

    // Process session data if provided - only for authenticated users
    let sessionId = sessionData?.sessionId;
    if (sessionData && sessionId && userId) {
      try {
        // Insert or update session (only for authenticated users)
        const sessionInsertData = {
          userId: userId,
          sessionId: sessionData.sessionId,
          deviceType: sessionData.deviceType ? sessionData.deviceType.substring(0, 20) : null,
          browser: sessionData.browser ? sessionData.browser.substring(0, 50) : null,
          os: sessionData.os ? sessionData.os.substring(0, 50) : null,
          userAgent: sessionData.userAgent,
          startedAt: new Date(sessionData.startTime),
          accessibilityModeUsed: sessionData.accessibilityModeUsed || false,
          textToSpeechUsed: sessionData.textToSpeechUsed || false,
          highContrastUsed: sessionData.highContrastUsed || false,
        };
        // Insert user session data
        await db.insert(userSessions).values(sessionInsertData).onConflictDoUpdate({
          target: userSessions.sessionId,
          set: {
            endedAt: new Date(),
            accessibilityModeUsed: sessionData.accessibilityModeUsed || false,
            textToSpeechUsed: sessionData.textToSpeechUsed || false,
            highContrastUsed: sessionData.highContrastUsed || false,
          }
        });
      } catch (error) {
        console.error('Error inserting/updating session:', error);
        console.error('Session data causing error:', JSON.stringify(sessionInsertData, null, 2));
      }
    }

    // Process events
    const processedEvents = {
      pageViews: [],
      userEvents: [],
      questionnaireAnalytics: [],
      featureUsage: [],
      performanceMetrics: [],
    };

    for (const event of events) {
      try {
        switch (event.type) {
          case 'page_view':
            processedEvents.pageViews.push({
              userId: userId || null,
              sessionId: sessionId || null,
              path: event.path ? event.path.substring(0, 500) : '/',
              title: event.title ? event.title.substring(0, 200) : null,
              referrer: event.referrer ? event.referrer.substring(0, 500) : null,
              timestamp: new Date(event.timestamp || timestamp),
              loadTime: safeInt(event.loadTime),
              clickCount: safeInt(event.clickCount) || 0,
              formInteractions: safeInt(event.formInteractions) || 0,
              scrollDepth: null,
            });
            break;

          case 'questionnaire_analytics':
            processedEvents.questionnaireAnalytics.push({
              questionnaireId: event.questionnaireId,
              userId: userId || null,
              sessionId: event.sessionId || sessionId || null,
              startTime: new Date(event.startTime),
              endTime: event.endTime ? new Date(event.endTime) : null,
              totalDuration: safeInt(event.totalDuration),
              avgQuestionTime: event.avgQuestionTime || null,
              questionsAnswered: safeInt(event.questionsAnswered || 0),
              questionsSkipped: safeInt(event.questionsSkipped || 0),
              questionsRevised: safeInt(event.questionsRevised || 0),
              completionRate: event.completionRate || null,
              pauseCount: safeInt(event.pauseCount || 0),
              totalPauseTime: safeInt(event.totalPauseTime || 0),
              backtrackCount: safeInt(event.backtrackCount || 0),
              dynamicQuestionsGenerated: safeInt(event.dynamicQuestionsGenerated || 0),
              aiHelpUsed: safeInt(event.aiHelpUsed || 0),
              responseQualityScore: event.responseQualityScore || null,
              engagementScore: event.engagementScore || null,
              deviceType: event.deviceType ? event.deviceType.substring(0, 20) : null,
              completedOn: event.completedOn ? event.completedOn.substring(0, 20) : null,
              finalStatus: event.finalStatus ? event.finalStatus.substring(0, 20) : 'partial',
              droppedAtQuestion: safeInt(event.droppedAtQuestion),
            });
            break;

          case 'performance_metrics':
            processedEvents.performanceMetrics.push({
              userId: userId || null,
              sessionId: sessionId || null,
              path: event.path ? event.path.substring(0, 500) : '/',
              lcp: event.lcp || null,
              fid: event.fid || null,
              cls: event.cls || null,
              fcp: event.fcp || null,
              ttfb: event.ttfb || null,
              connectionType: event.connectionType ? event.connectionType.substring(0, 20) : null,
              deviceMemory: event.deviceMemory || null,
              hardwareConcurrency: safeInt(event.hardwareConcurrency),
              jsHeapSizeUsed: safeInt(event.jsHeapSizeUsed),
              jsHeapSizeLimit: safeInt(event.jsHeapSizeLimit),
              timestamp: new Date(event.timestamp || timestamp),
            });
            break;

          default:
            // Regular user events
            processedEvents.userEvents.push({
              userId: userId || null,
              sessionId: sessionId || null,
              eventType: (event.eventType || 'custom').substring(0, 50),
              eventCategory: (event.eventCategory || 'general').substring(0, 50),
              eventAction: (event.eventAction || 'action').substring(0, 100),
              eventLabel: event.eventLabel ? event.eventLabel.substring(0, 200) : null,
              pageUrl: event.pageUrl ? event.pageUrl.substring(0, 500) : null,
              elementId: event.properties?.elementId ? event.properties.elementId.substring(0, 100) : null,
              elementClass: event.properties?.elementClass ? event.properties.elementClass.substring(0, 200) : null,
              elementText: event.properties?.elementText || null,
              eventValue: event.eventValue || null,
              properties: event.properties ? JSON.stringify(event.properties) : null,
              timestamp: new Date(event.timestamp || timestamp),
            });
            break;
        }
      } catch (error) {
        console.error('Error processing event:', event, error);
      }
    }

    // Batch insert all events
    const insertPromises = [];

    if (processedEvents.pageViews.length > 0) {
      insertPromises.push(
        db.insert(pageViews).values(processedEvents.pageViews).catch(error => {
          console.error('Error inserting page views:', error);
          console.error('Page view data:', JSON.stringify(processedEvents.pageViews, null, 2));
        })
      );
    }

    if (processedEvents.userEvents.length > 0) {
      insertPromises.push(
        db.insert(userEvents).values(processedEvents.userEvents).catch(error => {
          console.error('Error inserting user events:', error);
          console.error('User event data:', JSON.stringify(processedEvents.userEvents, null, 2));
        })
      );
    }

    if (processedEvents.questionnaireAnalytics.length > 0) {
      insertPromises.push(
        db.insert(questionnaireAnalytics).values(processedEvents.questionnaireAnalytics).catch(error => {
          console.error('Error inserting questionnaire analytics:', error);
          console.error('Questionnaire analytics data:', JSON.stringify(processedEvents.questionnaireAnalytics, null, 2));
        })
      );
    }

    if (processedEvents.performanceMetrics.length > 0) {
      insertPromises.push(
        db.insert(performanceMetrics).values(processedEvents.performanceMetrics).catch(error => {
          console.error('Error inserting performance metrics:', error);
          console.error('Performance metrics data:', JSON.stringify(processedEvents.performanceMetrics, null, 2));
        })
      );
    }

    // Handle feature usage separately (might need upsert logic)
    for (const event of events) {
      if (event.eventType === 'feature_usage' && userId) {
        try {
          const featureName = (event.properties?.featureName || event.eventAction || '').substring(0, 100);
          const featureCategory = event.eventCategory || 'general';
          
          await db.insert(featureUsage).values({
            userId,
            featureName,
            featureCategory,
            usageCount: 1,
            firstUsed: new Date(),
            lastUsed: new Date(),
            totalTimeUsed: 0,
            deviceType: event.properties?.deviceType || null,
            browserType: event.properties?.browser || null,
            successfulUses: event.properties?.success ? 1 : 0,
            errorCount: event.properties?.success === false ? 1 : 0,
            abandonmentCount: 0,
            metadata: event.properties ? JSON.stringify(event.properties) : null,
          }).onConflictDoUpdate({
            target: [featureUsage.userId, featureUsage.featureName],
            set: {
              usageCount: db.raw('usage_count + 1'),
              lastUsed: new Date(),
              successfulUses: event.properties?.success 
                ? db.raw('successful_uses + 1') 
                : db.raw('successful_uses'),
              errorCount: event.properties?.success === false 
                ? db.raw('error_count + 1') 
                : db.raw('error_count'),
              updatedAt: new Date(),
            }
          });
        } catch (error) {
          console.error('Error updating feature usage:', error);
          console.error('Feature usage data causing error:', JSON.stringify({
            featureName: featureName,
            featureCategory: featureCategory,
            event: event
          }, null, 2));
        }
      }
    }

    // Execute all inserts
    await Promise.allSettled(insertPromises);

    return NextResponse.json({ 
      success: true, 
      processed: events.length,
      breakdown: {
        pageViews: processedEvents.pageViews.length,
        userEvents: processedEvents.userEvents.length,
        questionnaireAnalytics: processedEvents.questionnaireAnalytics.length,
        performanceMetrics: processedEvents.performanceMetrics.length,
      }
    });

  } catch (error) {
    console.error('Analytics events processing error:', error);
    console.error('Request data:', JSON.stringify({ events, sessionData, timestamp }, null, 2));
    return NextResponse.json(
      { error: 'Failed to process analytics events' },
      { status: 500 }
    );
  }
}