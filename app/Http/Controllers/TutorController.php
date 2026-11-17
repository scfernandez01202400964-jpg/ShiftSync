<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTutorRequest;
use App\Http\Requests\UpdateTutorRequest;
use App\Models\Category;
use App\Models\Tutor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class TutorController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Tutor::class);

        $search = trim((string) $request->query('search', ''));

        $tutors = Tutor::with('category')
            ->when($search !== '', fn ($q) => $q->where(
                fn ($q) => $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
            ))
            ->orderBy('full_name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($t) => [
                'id' => $t->id,
                'username' => $t->username,
                'full_name' => $t->full_name,
                'category' => $t->category?->name,
                'rate' => $t->category?->rate,
                'status' => $t->status,
            ]);

        return Inertia::render('Tutors/Index', [
            'tutors' => $tutors,
            'filters' => ['search' => $search],
        ]);
    }

    public function create()
    {
        $this->authorize('create', Tutor::class);

        return Inertia::render('Tutors/Create', [
            'categories' => Category::select('id', 'name', 'rate')->orderBy('rate')->get(),
        ]);
    }

       public function store(StoreTutorRequest $request)
    {
        $data = $request->validated();
        $data['name'] = $data['full_name']; // users.name is required, so keep it in sync with full_name
        $data['password'] = Hash::make($data['password']);
        Tutor::create($data);

        return redirect()->route('tutors.index')->with('success', 'New tutor added successfully!');
    }

    public function edit(Tutor $tutor)
    {
        $this->authorize('update', $tutor);

        return Inertia::render('Tutors/Update', [
            'tutor' => $tutor->only('id', 'username', 'full_name', 'category_id', 'rate', 'status'),
            'categories' => Category::select('id', 'name', 'rate')->orderBy('rate')->get(),
        ]);
    }

        public function update(UpdateTutorRequest $request, Tutor $tutor)
    {
        $data = $request->validated();
        $data['name'] = $data['full_name'];

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $tutor->update($data);

        return redirect()->route('tutors.index')->with('success', 'Tutor updated successfully!');
    }

    public function destroy(Tutor $tutor)
    {
        $this->authorize('delete', $tutor);
        $tutor->delete();

        return redirect()->route('tutors.index')->with('success', 'Tutor removed.');
    }
}