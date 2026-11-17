<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function __invoke(Request $request)
    {
        return $request->user()->role === 'admin'
            ? app(DashboardController::class)->index($request)
            : app(TutorDashboardController::class)->index($request);
    }
}