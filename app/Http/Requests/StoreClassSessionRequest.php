<?php

namespace App\Http\Requests;

use App\Models\ClassSession;
use Illuminate\Foundation\Http\FormRequest;

class StoreClassSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', ClassSession::class);
    }

    public function rules(): array
    {
        return [
            'class_date' => ['required', 'date'],
            'classes' => ['required', 'array', 'min:1'],
            'classes.*.school' => ['required', 'string', 'max:100'],
            'classes.*.tutors_needed' => ['required', 'integer', 'min:1', 'max:100'],
            'classes.*.start_time' => ['required', 'date_format:H:i'],
            'classes.*.end_time' => ['required', 'date_format:H:i', 'after:classes.*.start_time'],
        ];
    }
}