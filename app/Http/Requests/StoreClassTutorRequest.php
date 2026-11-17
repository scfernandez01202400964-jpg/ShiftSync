<?php

namespace App\Http\Requests;

use App\Models\ClassTutor;
use Illuminate\Foundation\Http\FormRequest;

class StoreClassTutorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', ClassTutor::class);
    }

    public function rules(): array
    {
        return [
            'class_session_id' => ['required', 'exists:class_sessions,id'],
            'tutor_id' => ['required', 'exists:users,id'],
            'replaced_class_tutor_id' => ['nullable', 'exists:class_tutors,id'],
        ];
    }
}