<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClassSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('class_session'));
    }

    public function rules(): array
    {
        return [
            'school' => ['required', 'string', 'max:100'],
            'class_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'tutors_needed' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'in:proposed,finalized'],
        ];
    }
}