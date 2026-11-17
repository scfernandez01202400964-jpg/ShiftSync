<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('notification'));
    }

    public function rules(): array
    {
        return [
            'is_read' => ['required', 'boolean'],
        ];
    }
}