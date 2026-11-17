<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateTutorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('tutor'));
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'max:50', Rule::unique('users', 'username')->ignore($this->route('tutor'))],
            'full_name' => ['required', 'string', 'max:100'],
            'password' => ['nullable', 'confirmed', Password::min(8)],
            'category_id' => ['required', 'exists:categories,id'],
            'rate' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'in:Active,On Leave,Inactive'],
        ];
    }
}