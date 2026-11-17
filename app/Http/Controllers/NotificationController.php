<?php

namespace App\Http\Controllers;

use App\Support\Notify;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // The bell checks this every 20 seconds, so new alerts show up without reloading the page.
    public function summary(Request $request)
    {
        return response()->json(Notify::bellFor($request->user()));
    }

    // The bell's "Mark all as read".
    public function readAll(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return back();
    }
}