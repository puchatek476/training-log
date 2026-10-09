const SUPABASE_URL = "https://rirqxbkvqctagpyyhulw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ryTpMjIK81gA1n7Hu2T0nA_fTf5qIRW";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

const exercises = [
    {
        name: "Squat",
        custom: false,
        fields: ["weight", "reps", "rpe"]
    },
    {
        name: "Bench Press",
        custom: false,
        fields: ["weight", "reps", "rpe"]
    },
    {
        name: "Deadlift",
        custom: false,
        fields: ["weight", "reps", "rpe"]
    },
];

let workouts = [];

let gyms = [];

const FIELD_DEFINITIONS = {
    weight: {
        label: "Ciężar",
        placeholder: "kg",
        type: "number"
    },

    reps: {
        label: "Powtórzenia",
        placeholder: "Powt.",
        type: "number"
    },

    rpe: {
        label: "RPE",
        placeholder: "RPE",
        type: "number",
        step: "0.25"
    },

    seconds: {
        label: "Czas",
        placeholder: "sek.",
        type: "number"
    },

    band: {
        label: "Guma",
        placeholder: "Wybierz kolor",
        type: "select",
        options: [
            "Fioletowa",
            "Czerwona",
            "Czarna",
            "Niebieska",
            "Zielona",
            "Pomarańczowa"
        ]
    },

    setType: {
        label: "Typ serii",
        placeholder: "Wybierz typ",
        type: "select",
        options: [
            "Top-set",
            "Main",
            "Back-off",
            "Warmup"
        ]
    },
    deadliftStyle: {
        label: "Styl ciągu",
        placeholder: "Wybierz styl",
        type: "select",
        options: [
            "Sumo",
            "Tradycyjny"
        ]
    },

};

/* ELEMENTS */
const gymsView =
    document.querySelector("#gymsView");

const gymsTabButton =
    document.querySelector("#gymsTabButton");

const backToHistoryFromGymsButton =
    document.querySelector(
        "#backToHistoryFromGymsButton"
    );

const gymList =
    document.querySelector("#gymList");

const addGymButton =
    document.querySelector("#addGymButton");

const gymDialog =
    document.querySelector("#gymDialog");

const gymForm =
    document.querySelector("#gymForm");

const gymName =
    document.querySelector("#gymName");

const closeGymDialogButton =
    document.querySelector(
        "#closeGymDialogButton"
    );

const cancelGymButton =
    document.querySelector("#cancelGymButton");

const workoutGym =
    document.querySelector("#workoutGym");
const historyView = document.querySelector("#historyView");
const activeWorkoutView = document.querySelector("#activeWorkoutView");

const exercisesView =
    document.querySelector("#exercisesView");

const exerciseConfigView =
    document.querySelector("#exerciseConfigView");

const exercisesTabButton =
    document.querySelector("#exercisesTabButton");

const backToHistoryFromExercisesButton =
    document.querySelector(
        "#backToHistoryFromExercisesButton"
    );

const backToExercisesButton =
    document.querySelector("#backToExercisesButton");

const exerciseManagerList =
    document.querySelector("#exerciseManagerList");

const configExerciseName =
    document.querySelector("#configExerciseName");

const exerciseFieldsList =
    document.querySelector("#exerciseFieldsList");

const saveExerciseConfigButton =
    document.querySelector("#saveExerciseConfigButton");

const addCustomExerciseButton =
    document.querySelector("#addCustomExerciseButton");

const customExerciseDialog =
    document.querySelector("#customExerciseDialog");

const customExerciseForm =
    document.querySelector("#customExerciseForm");

const customExerciseName =
    document.querySelector("#customExerciseName");

const closeCustomExerciseDialogButton =
    document.querySelector(
        "#closeCustomExerciseDialogButton"
    );

const cancelCustomExerciseButton =
    document.querySelector(
        "#cancelCustomExerciseButton"
    );

let configuredExerciseName = null;

const editWorkoutButton =
    document.getElementById(
        "editWorkoutButton"
    );

const editWorkoutDialog =
    document.getElementById(
        "editWorkoutDialog"
    );

const editWorkoutForm =
    document.getElementById(
        "editWorkoutForm"
    );
const saveEditWorkoutButton =
    editWorkoutForm.querySelector(
        'button[type="submit"]'
    );
    

const editWorkoutName =
    document.getElementById(
        "editWorkoutName"
    );

const editWorkoutDate =
    document.getElementById(
        "editWorkoutDate"
    );

const editWorkoutGym =
    document.getElementById(
        "editWorkoutGym"
    );

const cancelEditWorkoutButton =
    document.getElementById(
        "cancelEditWorkoutButton"
    );

const addWorkoutButton = document.querySelector("#addWorkoutButton");

const searchInput = document.querySelector("#searchInput");
const exerciseFilter = document.querySelector("#exerciseFilter");
const sortFilter = document.querySelector("#sortFilter");

const workoutsList = document.querySelector("#workoutsList");
const resultsCount = document.querySelector("#resultsCount");
const clearFiltersButton = document.querySelector("#clearFiltersButton");
const backToCurrentWorkoutButton = document.querySelector("#backToCurrentWorkoutButton");

let returnToWorkoutId = null;

const workoutDialog = document.querySelector("#workoutDialog");
const workoutForm = document.querySelector("#workoutForm");
const saveWorkoutButton =
    document.getElementById(
        "saveWorkoutButton"
    );

const workoutName = document.querySelector("#workoutName");
const workoutDate = document.querySelector("#workoutDate");
const activeWorkoutNotes = document.querySelector("#activeWorkoutNotes");

const closeDialogButton = document.querySelector("#closeDialogButton");
const cancelDialogButton = document.querySelector("#cancelDialogButton");

const backToHistoryButton = document.querySelector("#backToHistoryButton");
const finishWorkoutButton = document.querySelector("#finishWorkoutButton");

const activeWorkoutName = document.querySelector("#activeWorkoutName");
const activeWorkoutDate = document.querySelector("#activeWorkoutDate");
const activeExercises = document.querySelector("#activeExercises");

const addExerciseButton = document.querySelector("#addExerciseButton");

const exerciseDialog = document.querySelector("#exerciseDialog");
const exerciseForm = document.querySelector("#exerciseForm");

const exerciseSelect = document.querySelector("#exerciseSelect");

const closeExerciseDialogButton =
document.querySelector("#closeExerciseDialogButton");

const cancelExerciseButton =
document.querySelector("#cancelExerciseButton");

let activeWorkoutId = null;
let isWorkoutEditing = false;

editWorkoutButton.addEventListener(
    "click",
    () => {

        if (!activeWorkoutId) return;

        isWorkoutEditing =
            !isWorkoutEditing;

        if (isWorkoutEditing) {

            editWorkoutButton.textContent =
                "Zakończ edycję";

            addExerciseButton.classList.remove(
                "hidden"
            );

            document.body.classList.add(
                "editing-workout"
            );

        } else {

            editWorkoutButton.textContent =
                "Edytuj";

            addExerciseButton.classList.add(
                "hidden"
            );

            document.body.classList.remove(
                "editing-workout"
            );
        }

        renderActiveWorkout();
    }
);

cancelEditWorkoutButton.addEventListener(
    "click",
    () => {

        editWorkoutDialog.close();

    }
);

editWorkoutForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        if (saveEditWorkoutButton.disabled) return;

        saveEditWorkoutButton.disabled = true;

        const workout =
            workouts.find(
                workout =>
                    workout.id === activeWorkoutId
            );

        if (!workout) {
            saveEditWorkoutButton.disabled = false;
            return;
        }

        const enteredDate =
            editWorkoutDate.value.trim();

        const date =
            parseUserDate(
                enteredDate
            );

        if (!date) {

            alert(
                "Wpisz poprawną datę w formacie DD/MM/RRRR."
            );

            saveEditWorkoutButton.disabled = false;
            return;
        }

        const name =
            editWorkoutName.value.trim();

        if (!name) {

            alert(
                "Wpisz nazwę treningu."
            );

            saveEditWorkoutButton.disabled = false;
            return;
        }

        const gymId =
            editWorkoutGym.value
                ? Number(editWorkoutGym.value)
                : null;

        const {
            data,
            error
        } =
            await supabaseClient
                .from("workouts")
                .update({
                    name: name,
                    workout_date: date,
                    gym_id: gymId
                })
                .eq(
                    "id",
                    workout.id
                )
                .select()
                .single();

        if (error) {

            console.error(
                "Błąd edycji treningu:",
                error
            );

            alert(
                "Nie udało się zapisać zmian."
            );

            saveEditWorkoutButton.disabled = false;
            return;
        }

        const selectedGym =
            gyms.find(
                gym =>
                    gym.id === data.gym_id
            );

        workout.name =
            data.name;

        workout.date =
            data.workout_date;

        workout.gymId =
            data.gym_id;

        workout.gym =
            selectedGym?.name || "";

        saveEditWorkoutButton.disabled = false;

        editWorkoutDialog.close();

        activeWorkoutName.textContent =
            workout.name;

        activeWorkoutDate.textContent =
            formatDate(
                workout.date
            );

        const activeWorkoutEyebrow =
            document.getElementById(
                "activeWorkoutEyebrow"
            );

        if (activeWorkoutEyebrow) {

            activeWorkoutEyebrow.textContent =
                workout.gym
                    ? `TRENING - ${workout.gym.toUpperCase()}`
                    : "TRENING";

        }

        refreshApp();

    }
);

/* DATE */

function getTodayInternal() {


const now = new Date();

return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
].join("-");


}

function formatDate(dateString) {


if (!dateString) return "";

const parts = dateString.split("-");

if (parts.length !== 3) {
    return dateString;
}

return `${parts[2]}/${parts[1]}/${parts[0]}`;


}

function parseUserDate(value) {


const parts = value.trim().split("/");

if (parts.length !== 3) {
    return null;
}

const day = parts[0];
const month = parts[1];
const year = parts[2];

if (
    day.length !== 2 ||
    month.length !== 2 ||
    year.length !== 4
) {
    return null;
}

const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
);

if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
) {
    return null;
}

return `${year}-${month}-${day}`;


}

function populateGymSelect() {

    workoutGym.innerHTML = "";

    gyms.forEach(gym => {

        const option =
            document.createElement("option");

        option.value =
            gym.id;

        option.textContent =
            gym.name;

        workoutGym.appendChild(option);

    });

}

async function renderGymList() {

    gymList.innerHTML =
        gyms.map(
            (gym) => {

                return `
                    <article class="exercise-manager-card">

                        <div>
                            <h3>${gym.name}</h3>
                        </div>

                    </article>
                `;

            }
        ).join("");

}

addGymButton.addEventListener(
    "click",
    () => {

        gymForm.reset();

        gymDialog.showModal();

        gymName.focus();

    }
);

const saveGymButton =
    gymForm.querySelector(
        'button[type="submit"]'
    );
gymForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        if (saveGymButton.disabled) return;

        saveGymButton.disabled = true;

        const name =
            gymName.value.trim();

        if (!name) {
            saveGymButton.disabled = false;
            return;
        }

        const exists =
            gyms.some(
                gym =>
                    gym.name.toLowerCase() ===
                    name.toLowerCase()
            );

        if (exists) {

            alert(
                "Taka siłownia już istnieje."
            );

            saveGymButton.disabled = false;
            return;
        }

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();

        if (!user) {

            alert(
                "Musisz być zalogowany."
            );

            saveGymButton.disabled = false;
            return;
        }

        const {
            data,
            error
        } =
            await supabaseClient
                .from("gyms")
                .insert({
                    user_id: user.id,
                    name: name
                })
                .select()
                .single();

        if (error) {

            console.error(
                "Błąd zapisu siłowni:",
                error
            );

            alert(
                "Nie udało się zapisać siłowni."
            );

            saveGymButton.disabled = false;
            return;
        }

        gyms.push({
            id: data.id,
            name: data.name
        });

        saveGymButton.disabled = false;

        gymDialog.close();

        renderGymList();

        populateGymSelect();

    }
);


closeGymDialogButton.addEventListener(
    "click",
    () => gymDialog.close()
);


cancelGymButton.addEventListener(
    "click",
    () => gymDialog.close()
);

gymsTabButton.addEventListener(
    "click",
    () => {

        historyView.classList.add("hidden");

        exercisesView.classList.add("hidden");

        exerciseConfigView.classList.add("hidden");

        gymsView.classList.remove("hidden");

        renderGymList();

    }
);


backToHistoryFromGymsButton.addEventListener(
    "click",
    () => {

        gymsView.classList.add("hidden");

        historyView.classList.remove("hidden");

    }
);

/* SET FORMAT */

function formatSet(set) {


let result =
    `${formatWeight(set.weight)} kg × ${set.reps}`;

if (
    set.rpe !== null &&
    set.rpe !== undefined &&
    set.rpe !== ""
) {
    result += ` @ ${set.rpe}`;
}

return result;


}

function formatWeight(weight) {


if (weight === "" || weight === null || weight === undefined) {
    return "—";
}

return weight;


}

/* EXERCISE FILTER */

function populateExerciseFilter() {


exerciseFilter.innerHTML =
    `<option value="">Wszystkie ćwiczenia</option>`;

exercises.forEach(exercise => {

    const option = document.createElement("option");

    option.value = exercise.name;
    option.textContent = exercise.name;

    exerciseFilter.appendChild(option);

});


}

/* EXERCISE SELECT */

function populateExerciseSelect() {

    exerciseSelect.innerHTML = "";

    exercises.forEach(exercise => {

        const option = document.createElement("option");

        option.value = exercise.name;
        option.textContent = exercise.name;

        exerciseSelect.appendChild(option);

    });

}

/* EXERCISE MANAGER */

function renderExerciseManager() {

    exerciseManagerList.innerHTML =
        exercises.map(exercise => {

            const fieldNames =
                exercise.fields
                    .map(
                        field =>
                            FIELD_DEFINITIONS[field]?.label
                    )
                    .filter(Boolean)
                    .join(" · ");

            return `
                <article
                    class="exercise-manager-card"
                >

                    <div>

                        <h3>
                            ${exercise.name}
                        </h3>

                        <p class="muted">
                            ${fieldNames || "Brak pól"}
                        </p>

                    </div>

                    <div class="exercise-manager-actions">

    <button
        type="button"
        class="button button-secondary configure-exercise-button"
        data-exercise-name="${exercise.name}"
    >
        Modyfikuj pola
    </button>

</div>

                </article>
            `;

        }).join("");


    document
        .querySelectorAll(".configure-exercise-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openExerciseConfig(
                        button.dataset.exerciseName
                    );

                }
            );

        });
}


function openExerciseConfig(name) {

    const exercise =
        exercises.find(
            exercise =>
                exercise.name === name
        );

    if (!exercise) return;

    configuredExerciseName = name;

    configExerciseName.textContent =
        exercise.name;

    exerciseFieldsList.innerHTML =
        Object.entries(FIELD_DEFINITIONS)
            .map(
                ([key, definition]) => {

                    const checked =
                        exercise.fields.includes(key);

                    return `
                        <label class="field-toggle">

                            <input
                                type="checkbox"
                                value="${key}"
                                ${checked ? "checked" : ""}
                            >

                            <span class="field-toggle-content">

                                <strong>
                                    ${definition.label}
                                </strong>

                                <small>
                                    ${definition.placeholder}
                                </small>

                            </span>

                        </label>
                    `;

                }
            )
            .join("");

    exercisesView.classList.add("hidden");

    exerciseConfigView.classList.remove(
        "hidden"
    );

}


async function saveExerciseConfig() {

    const exercise =
        exercises.find(
            exercise =>
                exercise.name ===
                configuredExerciseName
        );

    if (!exercise) return;


    const selectedFields =
        Array.from(
            exerciseFieldsList.querySelectorAll(
                'input[type="checkbox"]:checked'
            )
        ).map(
            checkbox => checkbox.value
        );


    if (!selectedFields.length) {

        alert(
            "Wybierz przynajmniej jedno pole."
        );

        return;
    }


    if (exercise.id) {

        const {
            error
        } =
            await supabaseClient
                .from("exercises")
                .update({
                    fields:
                        selectedFields
                })
                .eq(
                    "id",
                    exercise.id
                );

        if (error) {

            console.error(
                "Błąd zapisu pól ćwiczenia:",
                error
            );

            alert(
                "Nie udało się zapisać pól ćwiczenia."
            );

            return;
        }

    }

    exercise.fields =
        selectedFields;


    exerciseConfigView.classList.add(
        "hidden"
    );

    exercisesView.classList.remove(
        "hidden"
    );

    renderExerciseManager();

    populateExerciseFilter();

    populateExerciseSelect();

}
/* CUSTOM EXERCISE */

function openCustomExerciseDialog() {

    customExerciseForm.reset();

    customExerciseDialog.showModal();

    customExerciseName.focus();

}

const saveCustomExerciseButton =
    customExerciseForm.querySelector(
        'button[type="submit"]'
    );

customExerciseForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        if (saveCustomExerciseButton.disabled) return;

        saveCustomExerciseButton.disabled = true;

        const name =
            customExerciseName.value.trim();

        if (!name) {
            saveCustomExerciseButton.disabled = false;
            return;
        }

        const alreadyExists =
            exercises.some(
                exercise =>
                    exercise.name.toLowerCase() ===
                    name.toLowerCase()
            );

        if (alreadyExists) {

            alert(
                "Takie ćwiczenie już istnieje."
            );

            saveCustomExerciseButton.disabled = false;
            return;
        }

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();

        if (!user) {

            alert(
                "Musisz być zalogowany."
            );

            saveCustomExerciseButton.disabled = false;
            return;
        }

        const {
            data,
            error
        } =
            await supabaseClient
                .from("exercises")
                .insert({
                    user_id: user.id,
                    name: name,
                    custom: true,
                    fields: [
                        "weight",
                        "reps",
                        "rpe"
                    ]
                })
                .select()
                .single();

        if (error) {

            console.error(
                "Błąd zapisu ćwiczenia:",
                error
            );

            alert(
                "Nie udało się zapisać ćwiczenia."
            );

            saveCustomExerciseButton.disabled = false;
            return;
        }

        exercises.push({
            id: data.id,
            name: data.name,
            custom: data.custom,
            fields: data.fields
        });

        saveCustomExerciseButton.disabled = false;

        customExerciseDialog.close();

        renderExerciseManager();

        populateExerciseFilter();

        populateExerciseSelect();

        openExerciseConfig(name);

    }
);


closeCustomExerciseDialogButton.addEventListener(
    "click",
    () => customExerciseDialog.close()
);


cancelCustomExerciseButton.addEventListener(
    "click",
    () => customExerciseDialog.close()
);

/* HISTORY */

function openExerciseHistory(name) {

    if (!name) return;

    returnToWorkoutId = activeWorkoutId;

    activeWorkoutId = null;
    activeWorkoutView.classList.add("hidden");
    historyView.classList.remove("hidden");

    exerciseFilter.value = name;
    searchInput.value = "";

    renderWorkouts();
    updateReturnToWorkoutButton();

}

function updateReturnToWorkoutButton() {

    if (!backToCurrentWorkoutButton) return;

    const shouldShow = Boolean(returnToWorkoutId);

    backToCurrentWorkoutButton.classList.toggle("hidden", !shouldShow);

}

function returnToCurrentWorkout() {

    if (!returnToWorkoutId) return;

    const targetWorkoutId = returnToWorkoutId;
    returnToWorkoutId = null;
    exerciseFilter.value = "";
    searchInput.value = "";
    updateReturnToWorkoutButton();

    openWorkout(targetWorkoutId);

}

function attachExerciseHistoryLinks() {

    document
        .querySelectorAll("[data-exercise-history-name]")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {
                    event.stopPropagation();
                    openExerciseHistory(button.dataset.exerciseHistoryName);
                }
            );

            button.addEventListener(
                "keydown",
                event => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        openExerciseHistory(button.dataset.exerciseHistoryName);
                    }
                }
            );

        });

}

function renderWorkouts() {


const query =
    searchInput.value.trim().toLowerCase();

const exerciseFilterValue =
    exerciseFilter.value;

let filtered =
    workouts.filter(workout => {

        const matchesSearch =
            !query ||
            workout.name.toLowerCase().includes(query) ||
            workout.notes.toLowerCase().includes(query) ||
            workout.exercises.some(exercise =>
                exercise.name.toLowerCase().includes(query)
            );

        const matchesExercise =
            !exerciseFilterValue ||
            workout.exercises.some(
                exercise =>
                    exercise.name === exerciseFilterValue
            );

        return matchesSearch && matchesExercise;
    });


if (sortFilter.value === "newest") {

    filtered.sort(
        (a, b) => b.date.localeCompare(a.date)
    );

} else if (sortFilter.value === "oldest") {

    filtered.sort(
        (a, b) => a.date.localeCompare(b.date)
    );

} else if (sortFilter.value === "name") {

    filtered.sort(
        (a, b) =>
            a.name.localeCompare(
                b.name,
                "pl"
            )
    );
}


resultsCount.textContent =
    `${filtered.length} ${filtered.length === 1 ? "trening" : "treningów"}`;


if (!filtered.length) {

    workoutsList.innerHTML = `
        <div class="workout-card">
            <p class="muted">
                Brak treningów spełniających kryteria.
            </p>
        </div>
    `;

    return;
}


workoutsList.innerHTML =
    filtered.map(workout => {

        const visibleExercises =
            exerciseFilterValue
                ? workout.exercises.filter(
                    exercise =>
                        exercise.name === exerciseFilterValue
                )
                : workout.exercises;

        const exerciseTags =
            visibleExercises
                .map(
                    exercise =>
                        `<button
                            type="button"
                            class="exercise-pill"
                            data-exercise-history-name="${escapeHtml(exercise.name)}"
                        >
                            ${exercise.name}
                        </button>`
                )
                .join("");

        const matchingExerciseMarkup =
            exerciseFilterValue
                ? `<div class="exercise-history-compact">${visibleExercises
                    .map(exercise => renderExercise(exercise, 0, true))
                    .join("")}</div>`
                : "";

        return `
            <article
                class="workout-card"
                data-id="${workout.id}"
            >

                <div class="workout-card-header">

                    <div>

                        <h3>
                            ${workout.name}
                        </h3>

                        <div class="workout-date">
                            ${formatDate(workout.date)}
                        </div>

                    </div>

                </div>


                ${
                    exerciseFilterValue
                        ? matchingExerciseMarkup || "<p class=\"muted\">Brak ćwiczenia w tym treningu.</p>"
                        : exerciseTags
                            ? `<div class="workout-exercises">
                                ${exerciseTags}
                               </div>`
                            : ""
                }

            </article>
        `;

    }).join("");


document
    .querySelectorAll(".workout-card[data-id]")
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                openWorkout(
                    Number(card.dataset.id)
                );

            }
        );

    });

    attachExerciseHistoryLinks();


}

/* OPEN WORKOUT */

function openWorkout(id, startEditing = false) {

    if (returnToWorkoutId !== null && id !== returnToWorkoutId) {
        returnToWorkoutId = null;
        updateReturnToWorkoutButton();
    }

    activeWorkoutId = id;

    isWorkoutEditing = Boolean(startEditing);

    if (isWorkoutEditing) {
        editWorkoutButton.textContent =
            "Zakończ edycję";
        addExerciseButton.classList.remove("hidden");
        document.body.classList.add("editing-workout");
    } else {
        addExerciseButton.classList.add("hidden");
        editWorkoutButton.textContent =
            "Edytuj";
        document.body.classList.remove("editing-workout");
    }

    const workout =
        workouts.find(
            workout =>
                workout.id === id
        );

    if (!workout) return;


    activeWorkoutName.textContent =
        workout.name;


    activeWorkoutDate.textContent =
        formatDate(workout.date);


    const activeWorkoutEyebrow =
        document.getElementById(
            "activeWorkoutEyebrow"
        );


    if (activeWorkoutEyebrow) {

        activeWorkoutEyebrow.textContent =
            workout.gym
                ? `TRENING - ${workout.gym.toUpperCase()}`
                : "TRENING";

    }


    historyView.classList.add(
        "hidden"
    );

    activeWorkoutView.classList.remove(
        "hidden"
    );


    renderActiveWorkout();

    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto"
    });

    addExerciseButton.classList.toggle(
        "hidden",
        !isWorkoutEditing
    );

}

const deleteWorkoutButton =
    document.getElementById(
        "deleteWorkoutButton"
    );


deleteWorkoutButton.addEventListener(
    "click",
    async () => {

        const workout =
            workouts.find(
                workout =>
                    workout.id === activeWorkoutId
            );

        if (!workout) return;


        const confirmed =
            confirm(
                `Czy na pewno chcesz usunąć trening "${workout.name}"?`
            );


        if (!confirmed) return;


        /*
         * Usuń trening z Supabase.
         *
         * Ćwiczenia i serie zostaną
         * usunięte automatycznie dzięki
         * ON DELETE CASCADE.
         */

        const {
            error
        } =
            await supabaseClient
                .from("workouts")
                .delete()
                .eq(
                    "id",
                    workout.id
                );


        if (error) {

            console.error(
                "Błąd usuwania treningu:",
                error
            );

            alert(
                "Nie udało się usunąć treningu."
            );

            return;
        }


        /*
         * Usuń trening lokalnie
         */

        workouts =
            workouts.filter(
                item =>
                    item.id !== workout.id
            );


        /*
         * Wyzeruj aktywny trening
         */

        activeWorkoutId = null;


        /*
         * Wróć do historii
         */

        activeWorkoutView.classList.add(
            "hidden"
        );

        historyView.classList.remove(
            "hidden"
        );


        refreshApp();

    }
);

/* ACTIVE WORKOUT */

function renderActiveWorkout() {

    const workout =
        workouts.find(
            workout =>
                workout.id === activeWorkoutId
        );

    if (!workout) return;

    const nameField =
        document.querySelector(
            '.editable-workout-field[data-field="name"]'
        );

        const dateField =
            document.querySelector(
                '.editable-workout-field[data-field="date"]'
            );

        if (nameField) {

            nameField.innerHTML = `
                <h1 id="activeWorkoutName">
                    ${workout.name}
                </h1>

                <button
                    type="button"
                    class="inline-edit-button"
                    aria-label="Edytuj nazwę"
                >
                    ✎
                </button>
            `;
        }

        if (dateField) {

            dateField.innerHTML = `
                <p id="activeWorkoutDate" class="muted">
                    ${formatDate(workout.date)}
                </p>

                <button
                    type="button"
                    class="inline-edit-button"
                    aria-label="Edytuj datę"
                >
                    ✎
                </button>
            `;
        }

    activeWorkoutNotes.value =
        workout.notes || "";

if (!workout.exercises.length) {

    activeExercises.innerHTML = `
        <div class="workout-card">

            <h3>Brak ćwiczeń</h3>

            <p class="muted">
                Dodaj pierwsze ćwiczenie do treningu.
            </p>

        </div>
    `;

    return;
}


activeExercises.innerHTML =
    workout.exercises
        .map(
            (exercise, exerciseIndex) =>
                renderExercise(
                    exercise,
                    exerciseIndex
                )
        )
        .join("");


attachExerciseEvents();
attachExerciseHistoryLinks();
}


function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function renderExercise(
    exercise,
    exerciseIndex,
    highlightMaxWeight = false
) {

    const sets =
        exercise.sets || [];

    const exerciseConfig =
        exercises.find(
            item =>
                item.name === exercise.name
        );

    const fields =
        exerciseConfig?.fields ||
        ["weight", "reps", "rpe"];


    /* PODGLĄD */

    if (!isWorkoutEditing) {

        const groupedSets = [];

        const getNumericWeight = set => {
            if (set.weight === null || set.weight === undefined || String(set.weight).trim() === "") {
                return null;
            }

            const numericWeight = Number(set.weight);
            return Number.isFinite(numericWeight) ? numericWeight : null;
        };

        const maxWeight = highlightMaxWeight ? sets.reduce((highest, set) => {
            const numericWeight = getNumericWeight(set);
            return numericWeight === null
                ? highest
                : highest === null ? numericWeight : Math.max(highest, numericWeight);
        }, null) : null;

        sets.forEach((set, setIndex) => {
            const type = set.setType || "";
            const lastGroup = groupedSets[groupedSets.length - 1];

            if (lastGroup && lastGroup.type === type && type !== "") {
                lastGroup.items.push({ set, setIndex });
                return;
            }

            groupedSets.push({
                type,
                items: [{ set, setIndex }]
            });
        });

        const setRows =
            groupedSets.map((group) => {
                const rowsHtml = group.items.map(({ set, setIndex }) => {
                    const numericWeight = getNumericWeight(set);
                    const isMaxWeightSet = maxWeight !== null && numericWeight !== null && Math.abs(numericWeight - maxWeight) < 1e-9;

                    const primaryBits = [];
                    if (set.weight !== "" && set.weight !== null && set.weight !== undefined) {
                        primaryBits.push(`${set.weight} kg`);
                    }
                    if (set.reps !== "" && set.reps !== null && set.reps !== undefined) {
                        primaryBits.push(`${set.reps}`);
                    }

                    const secondaryBits = [];

                    if (set.band !== "" && set.band !== null && set.band !== undefined) {
                        secondaryBits.push(`Guma: ${set.band}`);
                    }

                    if (set.seconds !== "" && set.seconds !== null && set.seconds !== undefined) {
                        secondaryBits.push(`${set.seconds} sek.`);
                    }

                    const primaryText =
                        primaryBits.length
                            ? (() => {
                                const repsIndex = primaryBits.lastIndexOf(`${set.reps}`);
                                const parts = [...primaryBits];

                                if (set.rpe !== "" && set.rpe !== null && set.rpe !== undefined && repsIndex >= 0) {
                                    parts[repsIndex] = `${set.reps} @${set.rpe}`;
                                }

                                return parts.join(" × ");
                            })()
                            : "—";

                    return `
                        <div class="workout-view-set ${isMaxWeightSet ? "workout-view-set--max-weight" : ""}">

                            <span class="workout-view-set-number">
                                ${setIndex + 1}.
                            </span>

                            <div class="workout-view-set-values">
                                <div class="workout-view-primary-line">
                                    ${primaryText}
                                </div>

                                ${secondaryBits.length
                                    ? `<div class="workout-view-secondary-line">
                                        ${secondaryBits.join(" · ")}
                                      </div>`
                                    : ""
                                }
                            </div>

                        </div>
                    `;
                }).join("");

                const typeBadge =
                    group.type
                        ? `<span class="workout-view-type-pill">${escapeHtml(group.type)}</span>`
                        : "";

                return `
                    <div class="workout-view-group">
                        <div class="workout-view-group-items">
                            ${rowsHtml}
                        </div>
                        ${typeBadge}
                    </div>
                `;
            }).join("");


        
            const notes = exercise.notes?.trim()
                ? `
                    <div class="workout-view-notes">
                        <strong>Notatka:</strong>
                        <span>${escapeHtml(exercise.notes.trim())}</span>
                    </div>
                `
                : "";


        return `
            <section class="workout-view-exercise">

                <h2
                    class="exercise-name-trigger"
                    data-exercise-history-name="${escapeHtml(exercise.name)}"
                    tabindex="0"
                    role="button"
                >
                    ${exercise.name}
                </h2>

                ${setRows}

                ${notes}

            </section>
        `;

    }


    /* EDYCJA */

    const rows =
        sets.map(
            (set, setIndex) => {

                return `
                    <div
                        class="set-row"
                        data-exercise-index="${exerciseIndex}"
                        data-set-index="${setIndex}"
                    >

                        <div class="set-number">
                            ${setIndex + 1}
                        </div>

                        ${fields.map(field => {

                            const definition =
                                FIELD_DEFINITIONS[field];

                            if (definition.type === "select") {

                                return `
                                    <select
                                        class="set-field set-${field}"
                                        data-field="${field}"
                                    >

                                        <option value="">Wybierz</option>

                                        ${definition.options.map(option => `
                                            <option
                                                value="${option}"
                                                ${set[field] === option ? "selected" : ""}
                                            >
                                                ${option}
                                            </option>
                                        `).join("")}

                                    </select>
                                `;

                            }

                            return `
                                <input
                                    class="set-field set-${field}"
                                    data-field="${field}"
                                    type="${definition.type}"
                                    ${definition.step ? `step="${definition.step}"` : ""}
                                    placeholder="${definition.placeholder}"
                                    value="${set[field] ?? ""}"
                                >
                            `;

                        }).join("")}

                        <button
                            type="button"
                            class="remove-set"
                            title="Usuń serię"
                        >
                            ×
                        </button>

                    </div>
                `;

            }
        ).join("");


    const headerFields =
        fields.map(field => {

            return `
                <div>
                    ${FIELD_DEFINITIONS[field].label}
                </div>
            `;

        }).join("");


    return `
        <section class="active-exercise">

            <div class="exercise-header">

                <div class="exercise-title">

                    <h2>${exercise.name}</h2>

                </div>

                <button
                    type="button"
                    class="remove-exercise"
                    data-exercise-index="${exerciseIndex}"
                >
                    Usuń ćwiczenie
                </button>

            </div>

            <div class="set-row set-header">

                <div>SERIA</div>

                ${headerFields}

                <div></div>

            </div>

            ${rows}

            <div class="exercise-notes">

                <label class="form-field">

                    Notatki ćwiczenia

                    <textarea
                        class="exercise-notes-input"
                        data-exercise-index="${exerciseIndex}"
                        placeholder="Notatki dotyczące tego ćwiczenia..."
                        rows="3"
                    >${exercise.notes ?? ""}</textarea>

                </label>

            </div>

            <button
                type="button"
                class="add-set-button"
                data-exercise-index="${exerciseIndex}"
            >
                + Dodaj serię
            </button>

        </section>
    `;

}

function startInlineWorkoutEdit(
    container,
    field,
    value
) {

    if (
        container.querySelector(
            ".inline-workout-input"
        )
    ) {
        return;
    }

    const input =
        document.createElement("input");

    input.className =
        "inline-workout-input";

    input.type = "text";

if (field === "date") {

    input.value =
        value
            ? formatDate(value)
            : "";

} else {

    input.value =
        value || "";
}

    container.innerHTML = "";

    container.appendChild(input);

    input.focus();

    if (field !== "date") {
        input.select();
    }

    const save = async () => {

        if (
            !container.contains(input)
        ) {
            return;
        }

        const newValue =
            input.value.trim();

        if (!newValue) {
            renderActiveWorkout();
            return;
        }
        let valueToSave = newValue;

        if (field === "date") {

            valueToSave =
                parseUserDate(newValue);

            if (!valueToSave) {

                alert(
                    "Wpisz poprawną datę w formacie DD/MM/RRRR."
                );

                renderActiveWorkout();
                return;
            }
        }

        const workout =
            workouts.find(
                workout =>
                    workout.id ===
                    activeWorkoutId
            );

        if (!workout) return;

        let updateData = {};

        if (field === "name") {

            updateData.name =
                newValue;
        }

        if (field === "date") {

            updateData.workout_date =
                valueToSave;
        }

        const {
            error
        } =
            await supabaseClient
                .from("workouts")
                .update(updateData)
                .eq(
                    "id",
                    workout.id
                );

        if (error) {

            console.error(
                "Błąd zapisu:",
                error
            );

            alert(
                "Nie udało się zapisać zmian."
            );

            renderActiveWorkout();
            return;
        }

        if (field === "name") {

            workout.name =
                newValue;
        }

        if (field === "date") {

            workout.date =
                valueToSave;
        }

        renderActiveWorkout();
    };

    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {
                event.preventDefault();
                input.blur();
            }

            if (
                event.key === "Escape"
            ) {
                renderActiveWorkout();
            }
        }
    );

    input.addEventListener(
        "blur",
        save,
        { once: true }
    );
}
document.addEventListener(
    "click",
    event => {

        const editButton =
            event.target.closest(
                ".inline-edit-button"
            );

        if (!editButton) return;

        if (!isWorkoutEditing) return;

        const field =
            editButton.closest(
                ".editable-workout-field"
            );

        if (!field) return;

        const workout =
            workouts.find(
                workout =>
                    workout.id === activeWorkoutId
            );

        if (!workout) return;

        const type =
            field.dataset.field;

        startInlineWorkoutEdit(
            field,
            type,
            type === "name"
                ? workout.name
                : workout.date
        );
    }
);
/* ACTIVE EVENTS */

function attachExerciseEvents() {
const exerciseNotesSaveTimers = {};
document
    .querySelectorAll(".exercise-notes-input")
    .forEach(input => {

        input.addEventListener(
            "input",
            async event => {

                const exerciseIndex =
                    Number(
                        event.target.dataset.exerciseIndex
                    );

                const workout =
                    workouts.find(
                        workout =>
                            workout.id ===
                            activeWorkoutId
                    );

                if (!workout) return;


                const exercise =
                    workout.exercises[
                        exerciseIndex
                    ];

                if (!exercise) return;


                /*
                 * Aktualizuj lokalnie
                 */

                exercise.notes =
                    event.target.value;
                clearTimeout(
                    exerciseNotesSaveTimers[exercise.id]
                );

                exerciseNotesSaveTimers[exercise.id] =
                    setTimeout(
                        async () => {

                            if (!exercise.id) return;

                            const {
                                error
                            } =
                                await supabaseClient
                                    .from("workout_exercises")
                                    .update({
                                        notes:
                                            exercise.notes
                                    })
                                    .eq(
                                        "id",
                                        exercise.id
                                    );

                            if (error) {

                                console.error(
                                    "Błąd zapisu notatki ćwiczenia:",
                                    error
                                );

                            }

                        },
                        500
                    );
            }
        );

    });
document
    .querySelectorAll(".add-set-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                if (button.disabled) return;

                button.disabled = true;

                try {

                    const exerciseIndex =
                        Number(
                            button.dataset.exerciseIndex
                        );

                    await addSet(
                        exerciseIndex
                    );

                } finally {

                    button.disabled = false;

                }

            }
        );

    });


document
    .querySelectorAll(".remove-set")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const row =
                    button.closest(".set-row");

                const exerciseIndex =
                    Number(
                        row.dataset.exerciseIndex
                    );

                const setIndex =
                    Number(
                        row.dataset.setIndex
                    );

                removeSet(
                    exerciseIndex,
                    setIndex
                );

            }
        );

    });


document
    .querySelectorAll(".remove-exercise")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const exerciseIndex =
                    Number(
                        button.dataset.exerciseIndex
                    );

                removeExercise(
                    exerciseIndex
                );

            }
        );

    });


document
    .querySelectorAll(".set-row:not(.set-header) .set-field")
    .forEach(input => {

        input.addEventListener(
            "change",
            saveSetInput
        );

    });


}

/* SET MANAGEMENT */

async function addSet(exerciseIndex) {

    const workout =
        workouts.find(
            workout =>
                workout.id === activeWorkoutId
        );

    if (!workout) return;


    const exercise =
        workout.exercises[
            exerciseIndex
        ];

    if (!exercise) return;


    /*
     * Znajdź konfigurację ćwiczenia
     */

    const config =
        exercises.find(
            item =>
                item.name ===
                exercise.name
        );


    /*
     * Przygotuj dane nowej serii
     */

    const setData = {};


    (
        config?.fields ||
        ["weight", "reps", "rpe"]
    ).forEach(
        field => {

            setData[field] = "";

        }
    );


    /*
     * Znajdź ostatnią serię,
     * żeby ustawić kolejny numer
     */

    const setOrder =
        exercise.sets.length;


    /*
     * Zapisz serię w Supabase
     */

    const {
        data,
        error
    } =
        await supabaseClient
            .from("sets")
            .insert({
                workout_exercise_id:
                    exercise.id,

                set_order:
                    setOrder,

                data:
                    setData
            })
            .select()
            .single();


    if (error) {

        console.error(
            "Błąd dodawania serii:",
            error
        );

        alert(
            "Nie udało się zapisać serii."
        );

        return;
    }


    /*
     * Dodaj serię lokalnie
     */

    exercise.sets.push({

        id:
            data.id,

        ...setData

    });


    /*
     * Odśwież widok
     */

    renderActiveWorkout();

}

async function removeSet(
    exerciseIndex,
    setIndex
) {

    const workout =
        workouts.find(
            workout =>
                workout.id === activeWorkoutId
        );

    if (!workout) return;


    const exercise =
        workout.exercises[
            exerciseIndex
        ];

    if (!exercise) return;


    const set =
        exercise.sets[
            setIndex
        ];

    if (!set) return;


    /*
     * Usuń serię z Supabase
     */

    if (set.id) {

        const {
            error
        } =
            await supabaseClient
                .from("sets")
                .delete()
                .eq(
                    "id",
                    set.id
                );


        if (error) {

            console.error(
                "Błąd usuwania serii:",
                error
            );

            alert(
                "Nie udało się usunąć serii."
            );

            return;
        }

    }


    /*
     * Usuń serię lokalnie
     */

    exercise.sets.splice(
        setIndex,
        1
    );


    /*
     * Odśwież widok
     */

    renderActiveWorkout();

}

let workoutNotesSaveTimer = null;

activeWorkoutNotes.addEventListener(
    "input",
    () => {

        const workout =
            workouts.find(
                workout =>
                    workout.id === activeWorkoutId
            );

        if (!workout) return;

        workout.notes =
            activeWorkoutNotes.value;

        clearTimeout(
            workoutNotesSaveTimer
        );

        workoutNotesSaveTimer =
            setTimeout(
                async () => {

                    const {
                        error
                    } =
                        await supabaseClient
                            .from("workouts")
                            .update({
                                notes:
                                    workout.notes
                            })
                            .eq(
                                "id",
                                workout.id
                            );

                    if (error) {

                        console.error(
                            "Błąd zapisu notatki:",
                            error
                        );

                    }

                },
                500
            );

    }
);

async function saveSetInput(event) {

    const input =
        event.target;


    const row =
        input.closest(".set-row");


    const exerciseIndex =
        Number(
            row.dataset.exerciseIndex
        );


    const setIndex =
        Number(
            row.dataset.setIndex
        );


    const workout =
        workouts.find(
            workout =>
                workout.id === activeWorkoutId
        );


    if (!workout) return;


    const exercise =
        workout.exercises[
            exerciseIndex
        ];


    if (!exercise) return;


    const set =
        exercise.sets[
            setIndex
        ];


    if (!set) return;


    const field =
        input.dataset.field;


    if (!field) return;


    /*
     * Aktualizuj lokalny obiekt
     */

    set[field] =
        input.value;


    /*
     * Seria musi mieć ID z Supabase
     */

    if (!set.id) {

        console.error(
            "Brak ID serii w Supabase."
        );

        return;
    }


    /*
     * Pobierz aktualne dane serii
     */

    const setData = {
        ...set
    };


    /*
     * Nie zapisujemy ID jako części JSON.
     */

    delete setData.id;


    /*
     * Zapisz serię w Supabase
     */

    const {
        error
    } =
        await supabaseClient
            .from("sets")
            .update({
                data: setData
            })
            .eq(
                "id",
                set.id
            );


    if (error) {

        console.error(
            "Błąd zapisu serii:",
            error
        );

    }

}


/* EXERCISES */

function addExercise() {

    populateExerciseSelect();

    exerciseDialog.showModal();

}

async function removeExercise(
    exerciseIndex
) {

    const workout =
        workouts.find(
            workout =>
                workout.id === activeWorkoutId
        );

    if (!workout) return;


    const exercise =
        workout.exercises[
            exerciseIndex
        ];

    if (!exercise) return;


    /*
     * Usuń ćwiczenie z Supabase.
     *
     * Dzięki ON DELETE CASCADE
     * jego serie również zostaną usunięte.
     */

    if (exercise.id) {

        const {
            error
        } =
            await supabaseClient
                .from("workout_exercises")
                .delete()
                .eq(
                    "id",
                    exercise.id
                );


        if (error) {

            console.error(
                "Błąd usuwania ćwiczenia:",
                error
            );

            alert(
                "Nie udało się usunąć ćwiczenia."
            );

            return;
        }

    }


    /*
     * Usuń ćwiczenie lokalnie
     */

    workout.exercises.splice(
        exerciseIndex,
        1
    );


    /*
     * Odśwież widok
     */

    renderActiveWorkout();

}

/* NEW WORKOUT */

function openNewWorkoutDialog() {


workoutForm.reset();

workoutDate.value =
    formatDate(
        getTodayInternal()
    );

workoutDialog.showModal();

workoutName.focus();


}

/* SUBMIT NEW WORKOUT */

workoutForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        if (saveWorkoutButton.disabled) return;

        saveWorkoutButton.disabled = true;

        const enteredDate =
            workoutDate.value.trim();

        const date =
            parseUserDate(
                enteredDate
            );

        if (!date) {

            alert(
                "Wpisz poprawną datę w formacie DD/MM/RRRR."
            );
            saveWorkoutButton.disabled = false;
            return;
        }

        const name =
            workoutName.value.trim() ||
            formatDate(date);


        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user) {

            alert(
                "Musisz być zalogowany."
            );
            saveWorkoutButton.disabled = false;
            return;
        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("workouts")
                .insert({
                    user_id: user.id,
                    name: name,
                    workout_date: date,
                    gym_id: Number(workoutGym.value),
                    notes: ""
                })
                .select()
                .single();


        if (error) {

            console.error(
                "Błąd zapisu treningu:",
                error
            );

            alert(
                "Nie udało się zapisać treningu."
            );
            saveWorkoutButton.disabled = false;
            return;
        }


        const selectedGym =
            gyms.find(
                gym =>
                    gym.id === Number(workoutGym.value)
            );

        const newWorkout = {
            id: data.id,
            name: data.name,
            date: data.workout_date,
            gym: selectedGym?.name || "",
            gymId: selectedGym?.id || null,
            notes: data.notes,
            exercises: []
        };


        workouts.push(
            newWorkout
        );
        saveWorkoutButton.disabled = false;


        workoutDialog.close();


        refreshApp();


        openWorkout(
            newWorkout.id,
            true
        );

    }
);


const saveExerciseButton =
    exerciseForm.querySelector(
        'button[type="submit"]'
    );
/* ADD EXERCISE */

exerciseForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        if (saveExerciseButton.disabled) return;

        saveExerciseButton.disabled = true;

        const workout =
            workouts.find(
                workout =>
                    workout.id === activeWorkoutId
            );

        if (!workout) {
            saveExerciseButton.disabled = false;
            return;
        }

        const selectedExercise =
            exercises.find(
                exercise =>
                    exercise.name ===
                    exerciseSelect.value
            );

        if (!selectedExercise) {
            saveExerciseButton.disabled = false;
            return;
        }


        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user) {

            alert(
                "Musisz być zalogowany."
            );
            saveExerciseButton.disabled = false;
            return;
        }


        /*
         * ZNAJDŹ ID ĆWICZENIA
         *
         * Na razie szukamy go po nazwie.
         */

        const {
            data: exerciseData,
            error: exerciseError
        } =
            await supabaseClient
                .from("exercises")
                .select("id")
                .eq("user_id", user.id)
                .eq("name", selectedExercise.name)
                .maybeSingle();


        if (exerciseError) {

            console.error(
                "Błąd pobierania ćwiczenia:",
                exerciseError
            );

            alert(
                "Nie udało się znaleźć ćwiczenia."
            );
            saveExerciseButton.disabled = false;
            return;
        }


        /*
         * UTWÓRZ ĆWICZENIE W TRENINGU
         */

        const {
            data: workoutExercise,
            error: workoutExerciseError
        } =
            await supabaseClient
                .from("workout_exercises")
                .insert({
                    workout_id: workout.id,
                    exercise_id: exerciseData?.id ?? null,
                    name: selectedExercise.name,
                    notes: "",
                    exercise_order:
                        workout.exercises.length
                })
                .select()
                .single();


        if (workoutExerciseError) {

            console.error(
                "Błąd zapisu ćwiczenia:",
                workoutExerciseError
            );

            alert(
                "Nie udało się zapisać ćwiczenia."
            );
            saveExerciseButton.disabled = false;
            return;
        }


        /*
         * UTWÓRZ PIERWSZĄ SERIĘ
         */

        const firstSet = {};


        (
            selectedExercise.fields ||
            ["weight", "reps", "rpe"]
        ).forEach(
            field => {

                firstSet[field] = "";

            }
        );


        const {
            data: savedSet,
            error: setError
        } =
            await supabaseClient
                .from("sets")
                .insert({
                    workout_exercise_id:
                        workoutExercise.id,

                    set_order: 0,

                    data: firstSet
                })
                .select()
                .single();


        if (setError) {

            console.error(
                "Błąd zapisu serii:",
                setError
            );

            /*
             * Jeśli seria się nie zapisała,
             * usuwamy przed chwilą utworzone
             * ćwiczenie.
             */

            await supabaseClient
                .from("workout_exercises")
                .delete()
                .eq(
                    "id",
                    workoutExercise.id
                );


            alert(
                "Nie udało się zapisać pierwszej serii."
            );

            saveExerciseButton.disabled = false;
            return;
        }


        /*
         * AKTUALIZUJ LOKALNY OBIEKT
         */

        workout.exercises.push({

            id:
                workoutExercise.id,

            exerciseId:
                exerciseData?.id ?? null,

            name:
                selectedExercise.name,

            notes: "",

            sets: [
                {
                    id:
                        savedSet.id,

                    ...firstSet
                }
            ]

        });
        saveExerciseButton.disabled = false;

        exerciseDialog.close();


        renderActiveWorkout();

    }
);

/* NAVIGATION */

backToHistoryButton.addEventListener(
"click",
() => {


    activeWorkoutView.classList.add(
        "hidden"
    );

    historyView.classList.remove(
        "hidden"
    );

    activeWorkoutId = null;

    refreshApp();

}


);

finishWorkoutButton.addEventListener(
"click",
() => {


    activeWorkoutView.classList.add(
        "hidden"
    );

    historyView.classList.remove(
        "hidden"
    );

    activeWorkoutId = null;

    refreshApp();

}


);

/* EXERCISE NAVIGATION */

exercisesTabButton.addEventListener(
    "click",
    () => {

        historyView.classList.add("hidden");

        exercisesView.classList.remove("hidden");

        exerciseConfigView.classList.add("hidden");

        renderExerciseManager();

    }
);


backToHistoryFromExercisesButton.addEventListener(
    "click",
    () => {

        exercisesView.classList.add("hidden");

        historyView.classList.remove("hidden");

    }
);


backToExercisesButton.addEventListener(
    "click",
    () => {

        exerciseConfigView.classList.add("hidden");

        exercisesView.classList.remove("hidden");

        renderExerciseManager();

    }
);


saveExerciseConfigButton.addEventListener(
    "click",
    saveExerciseConfig
);


addCustomExerciseButton.addEventListener(
    "click",
    openCustomExerciseDialog
);

/* DIALOGS */

addWorkoutButton.addEventListener(
"click",
openNewWorkoutDialog
);

closeDialogButton.addEventListener(
"click",
() => workoutDialog.close()
);

cancelDialogButton.addEventListener(
"click",
() => workoutDialog.close()
);

addExerciseButton.addEventListener(
"click",
addExercise
);

closeExerciseDialogButton.addEventListener(
"click",
() => exerciseDialog.close()
);

cancelExerciseButton.addEventListener(
"click",
() => exerciseDialog.close()
);

/* FILTERS */

searchInput.addEventListener(
"input",
renderWorkouts
);

exerciseFilter.addEventListener(
"change",
renderWorkouts
);

sortFilter.addEventListener(
"change",
renderWorkouts
);

clearFiltersButton.addEventListener(
"click",
() => {


    searchInput.value = "";

    exerciseFilter.value = "";

    sortFilter.value = "newest";
    returnToWorkoutId = null;
    updateReturnToWorkoutButton();

    refreshApp();

}


);

backToCurrentWorkoutButton.addEventListener(
    "click",
    () => {
        returnToCurrentWorkout();
    }
);

/* LOAD DATA FROM SUPABASE */

async function loadDataFromSupabase() {

    const {
        data: {
            user
        }
    } =
        await supabaseClient.auth.getUser();


    if (!user) return;


    /*
     * POBIERZ SIŁOWNIE
     */

    const {
        data: gymData,
        error: gymError
    } =
        await supabaseClient
            .from("gyms")
            .select("*")
            .order("created_at");


    if (gymError) {

        console.error(
            "Błąd pobierania siłowni:",
            gymError
        );

        return;
    }


    gyms =
        gymData.map(
            gym => ({
                id: gym.id,
                name: gym.name
            })
        );


    /*
     * POBIERZ ĆWICZENIA
     */

    const {
        data: exerciseData,
        error: exerciseError
    } =
        await supabaseClient
            .from("exercises")
            .select("*")
            .order("created_at");


    if (exerciseError) {

        console.error(
            "Błąd pobierania ćwiczeń:",
            exerciseError
        );

        return;
    }


    exercises.length = 0;


    exerciseData.forEach(
        exercise => {

            exercises.push({

                id:
                    exercise.id,

                name:
                    exercise.name,

                custom:
                    exercise.custom,

                fields:
                    exercise.fields

            });

        }
    );


    /*
     * POBIERZ TRENINGI
     */

    const {
        data: workoutData,
        error: workoutError
    } =
        await supabaseClient
            .from("workouts")
            .select("*")
            .order(
                "workout_date",
                {
                    ascending: false
                }
            );


    if (workoutError) {

        console.error(
            "Błąd pobierania treningów:",
            workoutError
        );

        return;
    }


    /*
     * POBIERZ ĆWICZENIA W TRENINGACH
     */

    const workoutIds =
        workoutData.map(
            workout => workout.id
        );


    let workoutExerciseData = [];


    if (workoutIds.length > 0) {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("workout_exercises")
                .select("*")
                .in(
                    "workout_id",
                    workoutIds
                )
                .order(
                    "exercise_order"
                );


        if (error) {

            console.error(
                "Błąd pobierania ćwiczeń treningów:",
                error
            );

            return;
        }


        workoutExerciseData =
            data;

    }


    /*
     * POBIERZ SERIE
     */

    const workoutExerciseIds =
        workoutExerciseData.map(
            exercise =>
                exercise.id
        );


    let setData = [];


    if (
        workoutExerciseIds.length > 0
    ) {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("sets")
                .select("*")
                .in(
                    "workout_exercise_id",
                    workoutExerciseIds
                )
                .order(
                    "set_order"
                );


        if (error) {

            console.error(
                "Błąd pobierania serii:",
                error
            );

            return;
        }


        setData =
            data;

    }


    /*
     * ZBUDUJ workouts[]
     */

    workouts =
        workoutData.map(
            workout => {

                const workoutExercises =
                    workoutExerciseData
                        .filter(
                            exercise =>
                                exercise.workout_id ===
                                workout.id
                        )
                        .map(
                            exercise => {

                                const sets =
                                    setData
                                        .filter(
                                            set =>
                                                set.workout_exercise_id ===
                                                exercise.id
                                        )
                                        .map(
                                            set => ({

                                                id:
                                                    set.id,

                                                ...set.data

                                            })
                                        );


                                return {

                                    id:
                                        exercise.id,

                                    exerciseId:
                                        exercise.exercise_id,

                                    name:
                                        exercise.name,

                                    notes:
                                        exercise.notes,

                                    sets

                                };

                            }
                        );


                return {

                    id:
                        workout.id,

                    name:
                        workout.name,

                    date:
                        workout.workout_date,

                    gym:
                        gyms.find(
                            gym =>
                                gym.id ===
                                workout.gym_id
                        )?.name || "",

                    gymId:
                        workout.gym_id,

                    notes:
                        workout.notes,

                    exercises:
                        workoutExercises

                };

            }
        );


    /*
     * ODŚWIEŻ UI
     */

    refreshApp();

}

/* REFRESH */

function refreshApp() {


populateExerciseFilter();

populateExerciseSelect();

populateGymSelect();

renderWorkouts();


}

refreshApp();


const loginScreen =
    document.getElementById("login-screen");

const loginForm =
    document.getElementById("login-form");

const loginError =
    document.getElementById("login-error");

const app =
    document.querySelector(".app");


async function checkAuth() {
    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (session) {

        loginScreen.classList.remove("active");
        app.classList.remove("hidden");

        await loadDataFromSupabase();
    } else {
        loginScreen.classList.add("active");
        app.classList.add("hidden");
    }
}



loginForm.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        loginError.textContent = "";

        const email =
            document.getElementById("login-email").value;

        const password =
            document.getElementById("login-password").value;

        const {
            error
        } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            loginError.textContent =
                "Nieprawidłowy email lub hasło.";
            return;
        }

        await checkAuth();
    }
);


supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        if (event === "SIGNED_OUT") {
            loginScreen.classList.add("active");
            app.classList.add("hidden");
            return;
        }

        if (session) {
            loginScreen.classList.remove("active");
            app.classList.remove("hidden");

            if (
                event === "SIGNED_IN" ||
                event === "INITIAL_SESSION" ||
                event === "TOKEN_REFRESHED"
            ) {
                loadDataFromSupabase();
            }
        } else {
            loginScreen.classList.add("active");
            app.classList.add("hidden");
        }
    }
);

checkAuth();

const logoutButton =
    document.getElementById("logoutButton");

logoutButton.addEventListener(
    "click",
    async () => {
        await supabaseClient.auth.signOut();
    }
);


/* IMPORT / EXPORT JSON */

const importJsonButton = document.getElementById("importJsonButton");
const exportJsonButton = document.getElementById("exportJsonButton");
const importJsonFile = document.getElementById("importJsonFile");

function buildExportPayload() {
    return {
        format: "traininglog",
        version: 1,
        workouts: workouts.map(workout => ({
            date: workout.date,
            title: workout.name,
            gym: workout.gym || "",
            notes: workout.notes || "",
            exercises: (workout.exercises || []).map(exercise => ({
                name: exercise.name,
                notes: exercise.notes || "",
                sets: (exercise.sets || []).map(set => ({
                    data: Object.fromEntries(
                        Object.entries(set).filter(([key]) => key !== "id")
                    )
                }))
            }))
        }))
    };
}

exportJsonButton.addEventListener("click", () => {
    const payload = buildExportPayload();
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `traininglog-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
});

importJsonButton.addEventListener("click", () => {
    importJsonFile.value = "";
    importJsonFile.click();
});

importJsonFile.addEventListener("change", async () => {
    const file = importJsonFile.files?.[0];
    if (!file) return;

    importJsonButton.disabled = true;

    try {
        const text = await file.text();
        let json;

        try {
            json = JSON.parse(text);
        } catch {
            throw new Error("Plik nie zawiera poprawnego JSON.");
        }

        if (json.format !== "traininglog" || json.version !== 1) {
            throw new Error(
                'Nieobsługiwany format. Oczekuję "format": "traininglog" i "version": 1.'
            );
        }

        // Obsługujemy zarówno wiele treningów, jak i pojedynczy trening.
        const importedWorkouts = Array.isArray(json.workouts)
            ? json.workouts
            : json.workout
                ? [json.workout]
                : null;

        if (!importedWorkouts?.length) {
            throw new Error("JSON nie zawiera żadnych treningów.");
        }

        const errors = [];
        const validWorkouts = [];

        importedWorkouts.forEach((workout, wi) => {
            const label = `Trening ${wi + 1}`;

            if (
                !workout ||
                typeof workout.date !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(workout.date) ||
                Number.isNaN(Date.parse(`${workout.date}T00:00:00`))
            ) {
                errors.push(`${label}: niepoprawna data (wymagane RRRR-MM-DD).`);
                return;
            }

            if (
                typeof workout.title !== "string" ||
                !workout.title.trim()
            ) {
                errors.push(`${label}: brak nazwy w polu "title".`);
                return;
            }

            if (!Array.isArray(workout.exercises)) {
                errors.push(`${label}: pole "exercises" musi być tablicą.`);
                return;
            }

            let invalid = false;

            workout.exercises.forEach((exercise, ei) => {
                if (
                    !exercise ||
                    typeof exercise.name !== "string" ||
                    !exercise.name.trim()
                ) {
                    errors.push(`${label}, ćwiczenie ${ei + 1}: brak nazwy.`);
                    invalid = true;
                    return;
                }

                if (!Array.isArray(exercise.sets)) {
                    errors.push(
                        `${label}, ${exercise.name}: pole "sets" musi być tablicą.`
                    );
                    invalid = true;
                    return;
                }

                exercise.sets.forEach((set, si) => {
                    if (!set || typeof set !== "object" || Array.isArray(set)) {
                        errors.push(
                            `${label}, ${exercise.name}, seria ${si + 1}: niepoprawne dane.`
                        );
                        invalid = true;
                        return;
                    }

                    for (const [key, value] of Object.entries(set.data ?? set)) {
                        if (
                            value !== "" &&
                            value !== null &&
                            value !== undefined &&
                            !["weight", "reps", "rpe", "seconds", "band", "setType"].includes(key)
                        ) {
                            errors.push(
                                `${label}, ${exercise.name}, seria ${si + 1}: nieznane pole "${key}".`
                            );
                            invalid = true;
                        }

                        if (
                            ["weight", "reps", "rpe", "seconds"].includes(key) &&
                            value !== "" &&
                            value !== null &&
                            value !== undefined &&
                            (typeof value !== "number" || !Number.isFinite(value))
                        ) {
                            errors.push(
                                `${label}, ${exercise.name}, seria ${si + 1}: "${key}" musi być liczbą.`
                            );
                            invalid = true;
                        }
                    }
                });
            });

            if (!invalid) validWorkouts.push(workout);
        });

        if (errors.length) {
            const shown = errors.slice(0, 15).join("\n");
            const more = errors.length > 15
                ? `\n... i jeszcze ${errors.length - 15} błędów.`
                : "";

            alert(
                `Import przerwany — popraw błędy w pliku:\n\n${shown}${more}`
            );
            return;
        }

        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            throw new Error("Musisz być zalogowany.");
        }

        // Istniejące treningi o tej samej dacie i nazwie wymagają decyzji.
        const duplicates = validWorkouts.filter(item =>
            workouts.some(existing =>
                existing.date === item.date &&
                existing.name.trim().toLowerCase() === item.title.trim().toLowerCase()
            )
        );

        let toImport = validWorkouts;

        if (duplicates.length) {
            const duplicateKeys = new Set(
                duplicates.map(item =>
                    `${item.date}|${item.title.trim().toLowerCase()}`
                )
            );

            const skipDuplicates = confirm(
                `Znaleziono ${duplicates.length} treningów z datą i nazwą ` +
                `pasującą do istniejącej historii.\n\n` +
                `OK — pomiń treningi o tej samej dacie i nazwie.\n` +
                `Anuluj — przerwij import.`
            );

            if (!skipDuplicates) return;

            toImport = validWorkouts.filter(item =>
                !duplicateKeys.has(
                    `${item.date}|${item.title.trim().toLowerCase()}`
                )
            );
        }

        if (!toImport.length) {
            alert("Nie ma nowych treningów do zaimportowania.");
            return;
        }

        const setCount = toImport.reduce(
            (total, workout) =>
                total + workout.exercises.reduce(
                    (sum, exercise) => sum + exercise.sets.length,
                    0
                ),
            0
        );

        const confirmed = confirm(
            `Podsumowanie importu:\n\n` +
            `Treningi: ${toImport.length}\n` +
            `Ćwiczenia w treningach: ${toImport.reduce((n, w) => n + w.exercises.length, 0)}\n` +
            `Serie: ${setCount}\n\n` +
            `Czy zapisać te dane w Supabase?`
        );

        if (!confirmed) return;

        let importedCount = 0;

        for (const item of toImport) {
            let workoutId = null;

            try {
                const gymName = typeof item.gym === "string"
                    ? item.gym.trim().toLowerCase()
                    : "";

                const matchedGym = gyms.find(gym =>
                    gym.name.trim().toLowerCase() === gymName
                );

                const { data: savedWorkout, error: workoutError } =
                    await supabaseClient
                        .from("workouts")
                        .insert({
                            user_id: user.id,
                            name: item.title.trim(),
                            workout_date: item.date,
                            gym_id: matchedGym?.id ?? null,
                            notes: Array.isArray(item.notes)
                                ? item.notes.join("\n")
                                : (item.notes ?? "")
                        })
                        .select()
                        .single();

                if (workoutError) throw workoutError;

                workoutId = savedWorkout.id;

                for (const [exerciseIndex, exercise] of item.exercises.entries()) {
                    const definition = exercises.find(e =>
                        e.name.trim().toLowerCase() ===
                        exercise.name.trim().toLowerCase()
                    );

                    // Ćwiczenie może być historyczne i nie mieć definicji w katalogu.
                    const { data: savedExercise, error: exerciseError } =
                        await supabaseClient
                            .from("workout_exercises")
                            .insert({
                                workout_id: workoutId,
                                exercise_id: definition?.id ?? null,
                                name: exercise.name.trim(),
                                notes: exercise.notes ?? "",
                                exercise_order: exerciseIndex
                            })
                            .select()
                            .single();

                    if (exerciseError) throw exerciseError;

                    if (exercise.sets.length) {
                        
                        const rows = exercise.sets.map((set, setIndex) => {
                            const { id, ...rest } = set.data ?? set;

                           
                            if (typeof rest.setType === "string") {
                                const options = FIELD_DEFINITIONS.setType.options;

                                const option = options.find(
                                    value => value.toLowerCase() === rest.setType.toLowerCase()
                                );

                                if (option) {
                                    rest.setType = option;
                                }
                            }

                            return {
                                workout_exercise_id: savedExercise.id,
                                set_order: setIndex,
                                data: rest
                            };
                        });

                        const { error: setsError } =
                            await supabaseClient
                                .from("sets")
                                .insert(rows);

                        if (setsError) throw setsError;
                    }
                }

                importedCount++;
            } catch (error) {
                console.error("Błąd importu treningu:", error);

                // Spróbuj usunąć niekompletny trening; CASCADE usuwa jego ćwiczenia i serie.
                if (workoutId !== null) {
                    const { error: cleanupError } = await supabaseClient
                        .from("workouts")
                        .delete()
                        .eq("id", workoutId);

                    if (cleanupError) {
                        console.error("Nie udało się wycofać częściowego importu:", cleanupError);
                    }
                }

                throw new Error(
                    `Import zatrzymał się przy treningu "${item.title}". ` +
                    `Zapisano wcześniej ${importedCount} treningów. Szczegóły w konsoli.`
                );
            }
        }

        await loadDataFromSupabase();
        alert(`Import zakończony. Dodano ${importedCount} treningów.`);
    } catch (error) {
        console.error("Import JSON:", error);
        alert(error.message || "Nie udało się zaimportować pliku.");
    } finally {
        importJsonButton.disabled = false;
        importJsonFile.value = "";
    }
});