<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClassTutorRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Recording attendance is part of managing the class, so admin only.
        return $this->user()->can('update', $this->route('class_session'));
    }

    public function rules(): array
    {
        return [
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.id' => ['required', 'integer'],
            'rows.*.status' => ['required', 'in:pending,present,absent'],
            'rows.*.replacement_id' => ['nullable', 'integer'],
        ];
    }
}