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
let competitions = [];
let isWorkoutsLoading = true;
let activeCompetitionId = null;

let gyms = [];

const COMPETITION_LIFTS = [
    { key: "squat", label: "Przysiad" },
    { key: "bench", label: "Wyciskanie" },
    { key: "deadlift", label: "Martwy ciąg" }
];

const FIELD_DEFINITIONS = {
    weight: {
        label: "Ciężar",
        placeholder: "kg",
        type: "text",
        inputmode: "decimal",
        step: "any"
    },

    reps: {
        label: "Powtórzenia",
        placeholder: "Powt.",
        type: "text",
        inputmode: "decimal",
        step: "any"
    },

    rpe: {
        label: "RPE",
        placeholder: "RPE",
        type: "text",
        inputmode: "decimal",
        step: "0.25"
    },

    seconds: {
        label: "Czas (sekundy)",
        placeholder: "sek.",
        type: "number",
        inputmode: "numeric"
    },

    minutes: {
        label: "Czas (minuty)",
        placeholder: "min",
        type: "number",
        inputmode: "numeric"
    },

    load: {
        label: "Obciążenie",
        placeholder: "Wartość całkowita",
        type: "number",
        inputmode: "numeric",
        step: "1"
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

const NUMERIC_SET_FIELDS = [
    "weight",
    "reps",
    "rpe",
    "seconds",
    "minutes",
    "load"
];

function parseNumericInput(value) {
    const normalizedValue = String(value).trim().replace(",", ".");
    if (!normalizedValue) return null;

    const numericValue = Number(normalizedValue);
    return Number.isFinite(numericValue) ? numericValue : NaN;
}

const SBD_EXERCISE_NAMES = new Set([
    "squat",
    "bench press",
    "deadlift"
]);

function isSbdExercise(name) {
    return SBD_EXERCISE_NAMES.has(
        String(name).trim().toLocaleLowerCase()
    );
}

function getSbdExerciseBaseName(name) {
    const normalizedName = String(name).trim().toLocaleLowerCase();

    return [...SBD_EXERCISE_NAMES].find(
        baseName =>
            normalizedName === baseName ||
            (
                normalizedName.startsWith(`${baseName} (`) &&
                normalizedName.endsWith(")")
            )
    ) || null;
}

function isMainSbdExerciseInWorkout(workoutName, exerciseName) {
    const normalizedWorkoutName =
        String(workoutName).toLocaleLowerCase();
    const normalizedExerciseName =
        String(exerciseName).trim().toLocaleLowerCase();
    const workoutParts =
        normalizedWorkoutName.split(/\s*\+\s*/);
    const hasLiftSpecificParts =
        workoutParts.some(part =>
            [...SBD_EXERCISE_NAMES].some(name => part.includes(name))
        );

    if (!hasLiftSpecificParts) {
        return /(^|[^a-z0-9])main([^a-z0-9]|$)/.test(normalizedWorkoutName);
    }

    return workoutParts.some(part =>
        part.includes(normalizedExerciseName) &&
        /(^|[^a-z0-9])main([^a-z0-9]|$)/.test(part)
    );
}

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

const weeklyView =
    document.querySelector("#weeklyView");

const recordsView =
    document.querySelector("#recordsView");

const recordsViewButton =
    document.querySelector("#recordsViewButton");

const backToHistoryFromRecordsButton =
    document.querySelector("#backToHistoryFromRecordsButton");

const recordsTableBody =
    document.querySelector("#recordsTableBody");

const recordsProjectionResults =
    document.querySelector("#recordsProjectionResults");

const settingsView =
    document.querySelector("#settingsView");

const settingsViewButton =
    document.querySelector("#settingsViewButton");

const backToHistoryFromSettingsButton =
    document.querySelector("#backToHistoryFromSettingsButton");

const groupIdenticalSetsSetting =
    document.querySelector("#groupIdenticalSetsSetting");

const showPastTrainingPlansSetting =
    document.querySelector("#showPastTrainingPlansSetting");

const pastTrainingPlansStatus =
    document.querySelector("#pastTrainingPlansStatus");

const homeShortcutsSetting =
    document.querySelector("#homeShortcutsSetting");

const homeShortcutsStatus =
    document.querySelector("#homeShortcutsStatus");

const settingsStatus =
    document.querySelector("#settingsStatus");

const weeklyViewButton =
    document.querySelector("#weeklyViewButton");

const backToHistoryFromWeeklyButton =
    document.querySelector("#backToHistoryFromWeeklyButton");

const weeklyWorkoutList =
    document.querySelector("#weeklyWorkoutList");

const weeklyWorkoutSummary =
    document.querySelector("#weeklyWorkoutSummary");

const rareExercisesView =
    document.querySelector("#rareExercisesView");

const rareExercisesViewButton =
    document.querySelector("#rareExercisesViewButton");

const backToHistoryFromRareExercisesButton =
    document.querySelector("#backToHistoryFromRareExercisesButton");

const rareExercisesWorkoutCount =
    document.querySelector("#rareExercisesWorkoutCount");

const rareExercisesSettingsStatus =
    document.querySelector("#rareExercisesSettingsStatus");

const rareExercisesList =
    document.querySelector("#rareExercisesList");

let rareExercisesWorkoutLimit = 10;

const addCompetitionButton =
    document.querySelector("#addCompetitionButton");

const competitionView =
    document.querySelector("#competitionView");

const backFromCompetitionButton =
    document.querySelector("#backFromCompetitionButton");

const activeCompetitionName =
    document.querySelector("#activeCompetitionName");

const activeCompetitionDate =
    document.querySelector("#activeCompetitionDate");

const competitionNotes =
    document.querySelector("#competitionNotes");

const competitionLifts =
    document.querySelector("#competitionLifts");

const competitionTotal =
    document.querySelector("#competitionTotal");

const saveCompetitionButton =
    document.querySelector("#saveCompetitionButton");

const competitionSaveStatus =
    document.querySelector("#competitionSaveStatus");

const competitionDialog =
    document.querySelector("#competitionDialog");

const competitionForm =
    document.querySelector("#competitionForm");

const competitionName =
    document.querySelector("#competitionName");

const competitionDate =
    document.querySelector("#competitionDate");

const createCompetitionButton =
    document.querySelector("#createCompetitionButton");

const closeCompetitionDialogButton =
    document.querySelector("#closeCompetitionDialogButton");

const cancelCompetitionButton =
    document.querySelector("#cancelCompetitionButton");

const statisticsView =
    document.querySelector("#statisticsView");

const trainingPlanView =
    document.querySelector("#trainingPlanView");

const trainingPlanViewButton =
    document.querySelector("#trainingPlanViewButton");

const backToHistoryFromTrainingPlanButton =
    document.querySelector("#backToHistoryFromTrainingPlanButton");

const trainingPlanStatus =
    document.querySelector("#trainingPlanStatus");

const trainingPlanWorkoutListView =
    document.querySelector("#trainingPlanWorkoutListView");

const trainingPlanWorkoutDetailView =
    document.querySelector("#trainingPlanWorkoutDetailView");

const trainingPlanWorkoutList =
    document.querySelector("#trainingPlanWorkoutList");

const trainingPlanWorkoutTitle =
    document.querySelector("#trainingPlanWorkoutTitle");

const trainingPlanWorkoutDate =
    document.querySelector("#trainingPlanWorkoutDate");

const trainingPlanExercisePicker =
    document.querySelector("#trainingPlanExercisePicker");

const trainingPlanSelectedExercises =
    document.querySelector("#trainingPlanSelectedExercises");

const trainingPlanHistory =
    document.querySelector("#trainingPlanHistory");

const backToTrainingPlanWorkoutsButton =
    document.querySelector("#backToTrainingPlanWorkoutsButton");

const openSelectedWorkoutButton =
    document.querySelector("#openSelectedWorkoutButton");

const addTrainingPlanWorkoutButton =
    document.querySelector("#addTrainingPlanWorkoutButton");

const movePlannedExerciseDialog =
    document.querySelector("#movePlannedExerciseDialog");

const movePlannedExerciseForm =
    document.querySelector("#movePlannedExerciseForm");

const movePlannedExerciseName =
    document.querySelector("#movePlannedExerciseName");

const movePlannedExerciseStatus =
    document.querySelector("#movePlannedExerciseStatus");

const movePlannedExerciseTarget =
    document.querySelector("#movePlannedExerciseTarget");

const cancelMovePlannedExerciseButton =
    document.querySelector("#cancelMovePlannedExerciseButton");

const confirmMovePlannedExerciseButton =
    document.querySelector("#confirmMovePlannedExerciseButton");

let activeTrainingPlanWorkoutId = null;
let movingPlannedExerciseId = null;
let movingPlannedExerciseWorkoutId = null;
let isCreatingWorkoutFromPlan = false;
const plannedSetsSaveTimers = new Map();
const plannedSetsSaveQueues = new Map();

function getTrainingPlanFields(exerciseName) {
    const exercise = exercises.find(item =>
        item.name.trim().toLowerCase() === exerciseName.trim().toLowerCase()
    );
    const fields = exercise?.fields || ["weight", "reps", "rpe"];
    return fields.filter(field => FIELD_DEFINITIONS[field]);
}

function createEmptyPlannedSet(fields) {
    return Object.fromEntries(fields.map(field => [field, ""]));
}

function hasPlannedSets(exercise) {
    const fields = getTrainingPlanFields(exercise.name);
    return Array.isArray(exercise.plannedSets) &&
        exercise.plannedSets.some(set =>
            fields.some(field =>
                set[field] !== null &&
                set[field] !== undefined &&
                String(set[field]).trim() !== ""
            )
        );
}

const statisticsViewButton =
    document.querySelector("#statisticsViewButton");

const backToHistoryFromStatisticsButton =
    document.querySelector("#backToHistoryFromStatisticsButton");

const statisticsExerciseSelect =
    document.querySelector("#statisticsExerciseSelect");

const exerciseWeightChart =
    document.querySelector("#exerciseWeightChart");

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
const workoutDatePicker = document.querySelector("#workoutDatePicker");
const activeWorkoutNotes = document.querySelector("#activeWorkoutNotes");
const activeWorkoutNotesPreview =
    document.querySelector("#activeWorkoutNotesPreview");

const closeDialogButton = document.querySelector("#closeDialogButton");
const cancelDialogButton = document.querySelector("#cancelDialogButton");

const backToHistoryButton = document.querySelector("#backToHistoryButton");

const activeWorkoutName = document.querySelector("#activeWorkoutName");
const activeWorkoutDate = document.querySelector("#activeWorkoutDate");
const activeWorkoutEyebrow = document.querySelector("#activeWorkoutEyebrow");
const activeWorkoutGymSelect = document.querySelector("#activeWorkoutGymSelect");
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
let isExerciseOrderSaving = false;
let isActiveWorkoutGymEditing = false;
let groupIdenticalSets = false;
let showPastTrainingPlans = false;
let currentUserId = null;
const pendingSetSaveQueues = new Map();
const HOME_SHORTCUT_OPTIONS = [
    { id: "trainingPlanViewButton", label: "Plan" },
    { id: "statisticsViewButton", label: "Statystyki" },
    { id: "recordsViewButton", label: "Rekordy" },
    { id: "weeklyViewButton", label: "Ostatnie 7 dni" },
    { id: "gymsTabButton", label: "Siłownie" },
    { id: "importJsonButton", label: "Importuj" },
    { id: "exportJsonButton", label: "Eksportuj" },
    { id: "rareExercisesViewButton", label: "Najrzadziej wykonywane" },
    { id: "exercisesTabButton", label: "Ćwiczenia" },
    { id: "addCompetitionButton", label: "Dodaj zawody" },
    { id: "logoutButton", label: "Wyloguj" }
];
const DEFAULT_HOME_SHORTCUT_IDS = [
    "trainingPlanViewButton",
    "statisticsViewButton",
    "recordsViewButton",
    "weeklyViewButton"
];
const HEADER_MENU_ITEM_ORDER = [
    "gymsTabButton",
    "importJsonButton",
    "exportJsonButton",
    "rareExercisesViewButton",
    "settingsViewButton",
    "trainingPlanViewButton",
    "statisticsViewButton",
    "recordsViewButton",
    "weeklyViewButton",
    "exercisesTabButton",
    "addCompetitionButton",
    "importJsonFile",
    "logoutButton"
];
let homeShortcutIds = [...DEFAULT_HOME_SHORTCUT_IDS];
let draftHomeShortcutIds = [...DEFAULT_HOME_SHORTCUT_IDS];

window.addEventListener(
    "beforeunload",
    event => {
        if (pendingSetSaveQueues.size === 0) return;

        event.preventDefault();
        event.returnValue = "";
    }
);

function renderActiveWorkoutGymControl(workout) {

    activeWorkoutEyebrow.textContent =
        workout.gym || "TRENING";

    activeWorkoutGymSelect.innerHTML = [
        '<option value="">Bez siłowni</option>',
        ...gyms.map(
            gym =>
                `<option value="${gym.id}">${escapeHtml(gym.name)}</option>`
        )
    ].join("");

    activeWorkoutGymSelect.value =
        workout.gymId === null || workout.gymId === undefined
            ? ""
            : String(workout.gymId);

    activeWorkoutGymSelect.classList.toggle(
        "hidden",
        !isActiveWorkoutGymEditing
    );
}

activeWorkoutGymSelect.addEventListener(
    "change",
    async () => {

        const workout =
            workouts.find(
                item => item.id === activeWorkoutId
            );

        if (!workout) return;

        const previousGymId = workout.gymId;
        const gymId = activeWorkoutGymSelect.value
            ? Number(activeWorkoutGymSelect.value)
            : null;

        activeWorkoutGymSelect.disabled = true;

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("workouts")
                    .update({ gym_id: gymId })
                    .eq("id", workout.id)
                    .select("gym_id")
                    .single();

            if (error) throw error;

            const selectedGym =
                gyms.find(
                    gym => gym.id === data.gym_id
                );

            workout.gymId = data.gym_id;
            workout.gym = selectedGym?.name || "";
            isActiveWorkoutGymEditing = false;

            renderActiveWorkoutGymControl(workout);
            refreshApp();

        } catch (error) {

            console.error(
                "Błąd zapisu siłowni treningu:",
                error
            );

            workout.gymId = previousGymId;
            isActiveWorkoutGymEditing = false;
            renderActiveWorkoutGymControl(workout);

            alert(
                "Nie udało się zapisać siłowni treningu."
            );

        } finally {

            activeWorkoutGymSelect.disabled = false;
        }
    }
);

activeWorkoutGymSelect.addEventListener(
    "blur",
    () => {

        const workout =
            workouts.find(
                item => item.id === activeWorkoutId
            );

        if (!workout || !isActiveWorkoutGymEditing) return;

        const currentGymId =
            workout.gymId === null || workout.gymId === undefined
                ? ""
                : String(workout.gymId);

        if (activeWorkoutGymSelect.value === currentGymId) {
            isActiveWorkoutGymEditing = false;
            renderActiveWorkoutGymControl(workout);
        }
    }
);

editWorkoutButton.addEventListener(
    "click",
    () => {

        if (!activeWorkoutId) return;

        let visibleExerciseIndex = -1;
        let visibleExerciseTop = null;
        let lastVisibleExercise = null;

        [...activeExercises.children].forEach((exercise, index) => {
            const rect = exercise.getBoundingClientRect();

            if (rect.bottom > 0 && rect.top < window.innerHeight) {
                lastVisibleExercise = { index, top: rect.top };

                if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
                    visibleExerciseIndex = index;
                    visibleExerciseTop = rect.top;
                }
            }
        });

        if (visibleExerciseTop === null && lastVisibleExercise) {
            visibleExerciseIndex = lastVisibleExercise.index;
            visibleExerciseTop = lastVisibleExercise.top;
        }

        setWorkoutEditing(!isWorkoutEditing);

        renderActiveWorkout();

        if (visibleExerciseTop !== null) {
            requestAnimationFrame(() => {
                const exercise = activeExercises.children[visibleExerciseIndex];
                if (!exercise) return;

                const topDifference =
                    exercise.getBoundingClientRect().top - visibleExerciseTop;
                window.scrollBy(0, topDifference);
            });
        }
    }
);

function setWorkoutEditing(isEditing) {
    isWorkoutEditing = isEditing;

    if (!isWorkoutEditing) {
        isActiveWorkoutGymEditing = false;
    }

    editWorkoutButton.textContent =
        isWorkoutEditing ? "Zakończ edycję" : "Edytuj";
    addExerciseButton.classList.toggle(
        "hidden",
        !isWorkoutEditing
    );
    document.body.classList.toggle(
        "editing-workout",
        isWorkoutEditing
    );
}

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

        renderActiveWorkoutGymControl(workout);

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

function getRelativeDateLabel(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    const [todayYear, todayMonth, todayDay] = getTodayInternal()
        .split("-")
        .map(Number);
    const daysFromToday = (
        Date.UTC(year, month - 1, day) -
        Date.UTC(todayYear, todayMonth - 1, todayDay)
    ) / 86400000;

    if (daysFromToday === 0) return "Dzisiaj";
    if (daysFromToday === 1) return "Jutro";
    if (daysFromToday === 2) return "Pojutrze";
    if (daysFromToday > 2) return `Za ${daysFromToday} dni`;

    return "";
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

function syncDatePickerFromText(textInput, datePicker) {
    datePicker.value = parseUserDate(textInput.value) || "";
}

function bindDatePicker(textInput, datePicker) {
    textInput.addEventListener("input", () =>
        syncDatePickerFromText(textInput, datePicker)
    );

    datePicker.addEventListener("change", () => {
        if (datePicker.value) {
            textInput.value = formatDate(datePicker.value);
        }
    });
}

bindDatePicker(workoutDate, workoutDatePicker);

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

function getExercisesAlphabetically() {
    return [...exercises].sort((a, b) =>
        a.name.localeCompare(b.name, "pl")
    );
}

function populateExerciseFilter() {


exerciseFilter.innerHTML =
    `<option value="">Wszystkie ćwiczenia</option>`;

getExercisesAlphabetically().forEach(exercise => {

    const option = document.createElement("option");

    option.value = exercise.name;
    option.textContent = exercise.name;

    exerciseFilter.appendChild(option);

});


}

/* EXERCISE SELECT */

function getPopularExercises(exerciseList) {
    const exerciseUsageCounts = new Map();

    const recentWorkouts = [...workouts]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 25);

    recentWorkouts.forEach(workout => {
        (workout.exercises || []).forEach(workoutExercise => {
            const exerciseName =
                String(workoutExercise.name || "").trim().toLocaleLowerCase();

            if (exerciseName) {
                exerciseUsageCounts.set(
                    exerciseName,
                    (exerciseUsageCounts.get(exerciseName) || 0) + 1
                );
            }
        });
    });

    return exerciseList
        .filter(exercise =>
            exerciseUsageCounts.has(
                exercise.name.trim().toLocaleLowerCase()
            )
        )
        .sort((a, b) => {
            const aCount =
                exerciseUsageCounts.get(a.name.trim().toLocaleLowerCase());
            const bCount =
                exerciseUsageCounts.get(b.name.trim().toLocaleLowerCase());

            return bCount - aCount || a.name.localeCompare(b.name, "pl");
        })
        .slice(0, 10);
}

function populateExerciseSelect() {

    exerciseSelect.innerHTML = "";

    const alphabeticallySortedExercises =
        getExercisesAlphabetically();
    const popularExercises =
        getPopularExercises(alphabeticallySortedExercises);
    const appendExerciseOptions = (parent, exerciseList) => {
        exerciseList.forEach(exercise => {

            const option = document.createElement("option");

            option.value = exercise.name;
            option.textContent = exercise.name;

            parent.appendChild(option);

        });
    };

    if (popularExercises.length) {
        const popularGroup = document.createElement("optgroup");
        popularGroup.label = "Najczęściej wybierane";
        appendExerciseOptions(popularGroup, popularExercises);
        exerciseSelect.appendChild(popularGroup);
    }

    if (alphabeticallySortedExercises.length) {
        const allExercisesGroup = document.createElement("optgroup");
        allExercisesGroup.label = "Wszystkie ćwiczenia";
        appendExerciseOptions(
            allExercisesGroup,
            alphabeticallySortedExercises
        );
        exerciseSelect.appendChild(allExercisesGroup);
    }

}

/* EXERCISE MANAGER */

function renderExerciseManager() {

    exerciseManagerList.innerHTML =
        getExercisesAlphabetically().map(exercise => {

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
    isWorkoutEditing = false;
    document.body.classList.remove("editing-workout");
    activeWorkoutView.classList.add("hidden");
    historyView.classList.remove("hidden");

    exerciseFilter.value = name;
    searchInput.value = "";

    renderWorkouts();
    updateReturnToWorkoutButton();

    document.querySelector(".results-heading").scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        block: "start"
    });

}

function updateReturnToWorkoutButton() {

    if (!backToCurrentWorkoutButton) return;

    const shouldShow = Boolean(returnToWorkoutId);

    backToCurrentWorkoutButton.classList.toggle("hidden", !shouldShow);

}

function renderWeeklyWorkoutList() {
    if (isWorkoutsLoading) {
        weeklyWorkoutList.innerHTML = `
            <div class="workout-loading" role="status" aria-live="polite">
                <span class="loading-spinner" aria-hidden="true"></span>
                <span>Pobieranie danych...</span>
            </div>
        `;
        weeklyWorkoutSummary.innerHTML = "";
        return;
    }

    const todayKey = getTodayInternal();
    const today = new Date(`${todayKey}T12:00:00`);
    const firstSummaryDate = new Date(today);
    firstSummaryDate.setDate(today.getDate() - 6);
    const summaryStartKey = [
        firstSummaryDate.getFullYear(),
        String(firstSummaryDate.getMonth() + 1).padStart(2, "0"),
        String(firstSummaryDate.getDate()).padStart(2, "0")
    ].join("-");
    const visibleDateKeys = new Set(
        Array.from({ length: 7 }, (_, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (6 - index));

            return [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, "0"),
                String(date.getDate()).padStart(2, "0")
            ].join("-");
        })
    );

    workouts.forEach(workout => {
        if (workout.date > todayKey) {
            visibleDateKeys.add(workout.date);
        }
    });

    const days = [...visibleDateKeys].sort().map(dateKey => {
        const [year, month, day] = dateKey.split("-").map(Number);
        const date = new Date(year, month - 1, day, 12);
        const weekday = new Intl.DateTimeFormat("pl-PL", {
            weekday: "long"
        }).format(date);
        const formattedDate = new Intl.DateTimeFormat("pl-PL", {
            day: "numeric",
            month: "long"
        }).format(date);
        const dayWorkouts = workouts.filter(workout => workout.date === dateKey);
        const isToday = dateKey === todayKey;
        const singleWorkout = dayWorkouts.length === 1 ? dayWorkouts[0] : null;
        const workoutNames = dayWorkouts.map(workout => {
            const name = escapeHtml(workout.name);
            const workoutName = dayWorkouts.length > 1
                ? `<button type="button" class="weekly-workout-button" data-workout-id="${workout.id}">${name}</button>`
                : name;
            const relativeDateLabel = getRelativeDateLabel(workout.date);
            const plannedBadge = relativeDateLabel
                ? `<span class="weekly-planned-badge">${escapeHtml(relativeDateLabel)}</span>`
                : "";

            return `
                <li class="weekly-workout-item">
                    ${workoutName}
                    ${plannedBadge}
                </li>
            `;
        }).join("");

        return `
            <article
                class="weekly-day ${singleWorkout ? "weekly-day--clickable" : ""}"
                ${singleWorkout ? `data-workout-id="${singleWorkout.id}" role="button" tabindex="0" aria-label="Otwórz trening: ${escapeHtml(singleWorkout.name)}"` : ""}
            >
                <div class="weekly-day-heading">
                    <div class="weekly-day-title">
                        <h2>${escapeHtml(weekday)}</h2>
                        ${isToday ? '<span class="weekly-today-badge">DZISIAJ</span>' : ""}
                    </div>
                    <p>${escapeHtml(formattedDate)}</p>
                </div>
                <ul class="weekly-workout-names">
                    ${workoutNames}
                </ul>
            </article>
        `;
    });

    weeklyWorkoutList.innerHTML = days.join("");

    const workoutCounts = new Map();
    workouts
        .filter(workout =>
            workout.date >= summaryStartKey &&
            workout.date <= todayKey
        )
        .forEach(workout => {
            workout.name.split("+")
                .map(name => name.trim())
                .filter(Boolean)
                .forEach(name => {
                    const normalizedName = name.toLocaleLowerCase("pl-PL");
                    const existing = workoutCounts.get(normalizedName);
                    workoutCounts.set(normalizedName, {
                        name: existing?.name || name,
                        count: (existing?.count || 0) + 1
                    });
                });
        });

    const workoutGroups = new Map();
    [...workoutCounts.values()].forEach(item => {
        const [groupName] = item.name.split(/\s+/);
        const groupKey = groupName.toLocaleLowerCase("pl-PL");
        const group = workoutGroups.get(groupKey) || {
            name: groupName,
            items: []
        };
        group.items.push(item);
        workoutGroups.set(groupKey, group);
    });

    const summaryItems = [...workoutGroups.values()]
        .sort((a, b) => a.name.localeCompare(b.name, "pl"))
        .map(group => {
            const items = group.items
                .sort((a, b) => a.name.localeCompare(b.name, "pl"))
                .map(item => `
                    <li>
                        <strong>${item.count} ×</strong>
                        <span>${escapeHtml(item.name)}</span>
                    </li>
                `)
                .join("");

            return `
                <section class="weekly-workout-summary-group">
                    <ul>${items}</ul>
                </section>
            `;
        })
        .join("");

    weeklyWorkoutSummary.innerHTML = `
        <h2>Treningi wykonane w ostatnich 7 dniach</h2>
        ${summaryItems
            ? `<div class="weekly-workout-summary-list">${summaryItems}</div>`
            : '<p class="muted">Brak wykonanych treningów w tym okresie.</p>'}
    `;

    weeklyWorkoutList
        .querySelectorAll(".weekly-day[data-workout-id]")
        .forEach(day => {
            const openWorkoutForDay = () =>
                openWorkout(Number(day.dataset.workoutId));

            day.addEventListener("click", openWorkoutForDay);
            day.addEventListener("keydown", event => {
                if (event.key !== "Enter" && event.key !== " ") return;

                event.preventDefault();
                openWorkoutForDay();
            });
        });

    weeklyWorkoutList
        .querySelectorAll(".weekly-workout-button")
        .forEach(button => {
            button.addEventListener("click", () =>
                openWorkout(Number(button.dataset.workoutId))
            );
        });
}

const RPE_10_PERCENTAGES = [
    null,
    1,
    0.955,
    0.922,
    0.892,
    0.863,
    0.837,
    0.811,
    0.786,
    0.762,
    0.739,
    0.716,
    0.694
];

const MAX_ESTIMATED_REPS = 19;

function getRpe10Percentage(reps) {
    if (reps <= RPE_10_PERCENTAGES.length - 1) {
        return RPE_10_PERCENTAGES[reps];
    }

    // Extend the chart above 12 reps with the Brzycki formula.
    return (37 - reps) / 36;
}

function estimateOneRepMax(weight, reps, rpe) {
    if (!Number.isFinite(rpe) || rpe < 6 || rpe > 10) return null;

    const equivalentReps = reps + (10 - rpe);
    if (equivalentReps < 1 || equivalentReps > MAX_ESTIMATED_REPS) return null;

    const lowerReps = Math.floor(equivalentReps);
    const upperReps = Math.ceil(equivalentReps);
    const lowerPercentage = getRpe10Percentage(lowerReps);
    const upperPercentage = getRpe10Percentage(upperReps);

    const percentage = lowerReps === upperReps
        ? lowerPercentage
        : lowerPercentage +
            (upperPercentage - lowerPercentage) *
            (equivalentReps - lowerReps);

    return weight / percentage;
}

function formatProjectedWeight(weight) {
    return weight.toLocaleString("pl-PL", {
        maximumFractionDigits: 1
    });
}

function renderSbdRecords() {
    const lifts = [
        { key: "squat", label: "Przysiad" },
        { key: "bench press", label: "Wyciskanie" },
        { key: "deadlift", label: "Martwy ciąg" }
    ];

    if (isWorkoutsLoading) {
        recordsProjectionResults.innerHTML =
            '<p class="records-empty">Pobieranie treningów...</p>';
        recordsTableBody.innerHTML = `
            <tr>
                <td class="records-empty" colspan="4">Pobieranie treningów...</td>
            </tr>
        `;
        return;
    }

    const records = new Map(
        lifts.map(lift => [lift.key, new Map()])
    );
    const projectedMaxes = new Map(
        lifts.map(lift => [lift.key, null])
    );
    const todayKey = getTodayInternal();

    workouts.forEach(workout => {
        if (workout.date > todayKey) return;

        workout.exercises.forEach(exercise => {
            const liftKey = getSbdExerciseBaseName(exercise.name);
            if (!liftKey) return;

            (exercise.sets || []).forEach(set => {
                const reps = Number(set.reps);
                const weight = Number(set.weight);

                if (
                    Number.isInteger(reps) &&
                    reps > 0 &&
                    reps <= 15 &&
                    set.reps !== "" &&
                    set.reps !== null &&
                    set.reps !== undefined &&
                    set.weight !== "" &&
                    set.weight !== null &&
                    set.weight !== undefined &&
                    Number.isFinite(weight) &&
                    weight > 0
                ) {
                    const enteredRpe =
                        set.rpe === "" ||
                        set.rpe === null ||
                        set.rpe === undefined
                            ? 10
                            : Number(set.rpe);
                    const estimatedMax = estimateOneRepMax(
                        weight,
                        reps,
                        enteredRpe
                    );
                    const currentEstimate = projectedMaxes.get(liftKey);

                    if (
                        estimatedMax !== null &&
                        (!currentEstimate || estimatedMax > currentEstimate.weight)
                    ) {
                        projectedMaxes.set(liftKey, {
                            weight: estimatedMax,
                            date: workout.date
                        });
                    }
                }

                if (
                    ![1, 2, 3].includes(reps) ||
                    set.reps === "" ||
                    set.reps === null ||
                    set.reps === undefined ||
                    set.weight === "" ||
                    set.weight === null ||
                    set.weight === undefined ||
                    !Number.isFinite(weight) ||
                    weight < 0
                ) {
                    return;
                }

                const liftRecords = records.get(liftKey);
                const currentRecord = liftRecords.get(reps);
                if (!currentRecord || weight > currentRecord.weight) {
                    liftRecords.set(reps, {
                        weight,
                        rpe: set.rpe,
                        date: workout.date
                    });
                }
            });
        });
    });

    competitions.forEach(competition => {
        if (competition.date > todayKey) return;

        competition.lifts.forEach(lift => {
            const liftKey = lift.liftKey === "bench" ? "bench press" : lift.liftKey;
            const liftRecords = records.get(liftKey);
            if (!liftRecords) return;

            (lift.attempts || []).forEach(attempt => {
                const weight = Number(attempt.weight);
                if (
                    attempt.result !== "success" ||
                    attempt.weight === "" ||
                    attempt.weight === null ||
                    attempt.weight === undefined ||
                    !Number.isFinite(weight) ||
                    weight < 0
                ) {
                    return;
                }

                const currentEstimate = projectedMaxes.get(liftKey);
                if (!currentEstimate || weight > currentEstimate.weight) {
                    projectedMaxes.set(liftKey, {
                        weight,
                        date: competition.date
                    });
                }

                const currentRecord = liftRecords.get(1);
                if (!currentRecord || weight > currentRecord.weight) {
                    liftRecords.set(1, {
                        weight,
                        rpe: null,
                        date: competition.date
                    });
                }
            });
        });
    });

    const estimatedLiftRows = lifts.map(lift => {
        const estimate = projectedMaxes.get(lift.key);
        return `
            <div class="records-projection-lift">
                <span>${lift.label}</span>
                <strong>${estimate ? `${formatProjectedWeight(estimate.weight)} kg` : "—"}</strong>
            </div>
        `;
    }).join("");
    const missingEstimates = lifts.filter(
        lift => !projectedMaxes.get(lift.key)
    );
    const projectedTotal = missingEstimates.length
        ? "—"
        : formatProjectedWeight(
            lifts.reduce(
                (total, lift) => total + projectedMaxes.get(lift.key).weight,
                0
            )
        );

    recordsProjectionResults.innerHTML = `
        <div class="records-projection-lifts">
            ${estimatedLiftRows}
        </div>
        <div class="records-projection-total">
            <span>Total SBD</span>
            <strong>${projectedTotal}${projectedTotal === "—" ? "" : " kg"}</strong>
        </div>
        ${missingEstimates.length
            ? `<p class="records-projection-missing">Brak danych dla: ${missingEstimates.map(lift => lift.label).join(", ")}.</p>`
            : ""}
    `;

    recordsTableBody.innerHTML = lifts.map(lift => {
        const liftRecords = records.get(lift.key);
        const cells = [1, 2, 3].map(reps => {
            const record = liftRecords.get(reps);
            if (!record) {
                return '<td class="records-empty">—</td>';
            }

            const rpe = record.rpe !== null &&
                record.rpe !== undefined &&
                String(record.rpe).trim() !== ""
                ? `<span>RPE ${escapeHtml(record.rpe)}</span>`
                : "";

            return `
                <td>
                    <div class="record-result">
                        <strong>${escapeHtml(record.weight)} kg</strong>
                        ${rpe}
                        <time datetime="${escapeHtml(record.date)}">${escapeHtml(formatDate(record.date))}</time>
                    </div>
                </td>
            `;
        }).join("");

        return `
            <tr>
                <th scope="row">${lift.label}</th>
                ${cells}
            </tr>
        `;
    }).join("");
}

    function renderRareExercises() {
        if (isWorkoutsLoading) {
            rareExercisesList.innerHTML = `
                <li class="muted" role="status">Pobieranie treningów...</li>
            `;
            return;
        }

        const workoutCount = rareExercisesWorkoutLimit;
        const recentWorkouts = [...workouts]
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, workoutCount);
        const exerciseNames = new Map();

        recentWorkouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                const name = exercise.name.trim();
                exerciseNames.set(name.toLocaleLowerCase(), name);
            });
        });

        const exerciseCounts = [...exerciseNames.entries()]
            .map(([normalizedName, name]) => ({
                name,
                count: recentWorkouts.filter(workout =>
                    workout.exercises.some(exercise =>
                        exercise.name.trim().toLocaleLowerCase() === normalizedName
                    )
                ).length
            }))
            .sort((a, b) =>
                a.count - b.count || a.name.localeCompare(b.name, "pl")
            );

        if (!exerciseCounts.length) {
            rareExercisesList.innerHTML = `
                <li class="muted">Brak ćwiczeń do wyświetlenia.</li>
            `;
            return;
        }

        rareExercisesList.innerHTML = exerciseCounts
            .map(({ name, count }) => `
                <li class="rare-exercise-row">
                    <span>${escapeHtml(name)}</span>
                    <span class="rare-exercise-count">${count} z ${recentWorkouts.length} treningów</span>
                </li>
            `)
            .join("");
    }

function renderStatistics() {
    const exerciseNames = [...new Set(
        exercises
            .map(exercise => exercise.name)
    )]
        .sort((a, b) => a.localeCompare(b, "pl"));
    const selectedExercise = statisticsExerciseSelect.value;

    statisticsExerciseSelect.innerHTML = exerciseNames
        .map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
        .join("");

    if (!exerciseNames.length) {
        exerciseWeightChart.innerHTML = `
            <p class="muted">Brak ćwiczeń do wyświetlenia.</p>
        `;
        return;
    }

    statisticsExerciseSelect.value = exerciseNames.includes(selectedExercise)
        ? selectedExercise
        : exerciseNames[0];

    renderExerciseWeightChart(statisticsExerciseSelect.value);
}

function renderExerciseWeightChart(exerciseName) {
    const normalizedExerciseName = String(exerciseName).trim().toLocaleLowerCase();

    const matchingWorkouts = workouts.filter(workout =>
        workout.exercises.some(exercise =>
            exercise.name.trim().toLocaleLowerCase() === normalizedExerciseName
        )
    );
    const mainSbdWorkouts = isSbdExercise(exerciseName)
        ? matchingWorkouts.filter(workout =>
            isMainSbdExerciseInWorkout(workout.name, exerciseName)
        )
        : [];
    const sourceWorkouts = isSbdExercise(exerciseName) && mainSbdWorkouts.length
        ? mainSbdWorkouts
        : matchingWorkouts;
    const getSets = workout => workout.exercises
        .filter(exercise =>
            exercise.name.trim().toLocaleLowerCase() === normalizedExerciseName
        )
        .flatMap(exercise => exercise.sets || []);
    const getNumericValue = value => {
        if (value === "" || value === null || value === undefined) return null;

        const numericValue = Number(value);
        return Number.isFinite(numericValue) && numericValue >= 0
            ? numericValue
            : null;
    };
    const weightPoints = sourceWorkouts.flatMap(workout => {
        const weights = getSets(workout)
            .map(set => getNumericValue(set.weight))
            .filter(weight => weight !== null);

        return weights.length
            ? [{ date: workout.date, name: workout.name, value: Math.max(...weights) }]
            : [];
    });
    const metric = weightPoints.length ? "weight" : "seconds";
    const dataPoints = metric === "weight"
        ? weightPoints
        : sourceWorkouts.flatMap(workout => {
            const durations = getSets(workout)
                .map(set => {
                    const seconds = getNumericValue(set.seconds);
                    const minutes = getNumericValue(set.minutes);

                    if (seconds === null && minutes === null) return null;

                    return (minutes ?? 0) * 60 + (seconds ?? 0);
                })
                .filter(duration => duration !== null);

            return durations.length
                ? [{ date: workout.date, name: workout.name, value: Math.max(...durations) }]
                : [];
            });

            dataPoints.sort((a, b) => a.date.localeCompare(b.date));

    if (!dataPoints.length) {
        exerciseWeightChart.innerHTML = `
            <p class="muted">Brak zapisanych danych dla ćwiczenia „${escapeHtml(exerciseName)}”.</p>
        `;
        return;
    }

    const width = Math.max(320, Math.min(760, exerciseWeightChart.clientWidth));
    const height = width < 500 ? 280 : 360;
    const left = 64;
    const right = 24;
    const top = 24;
    const bottom = 62;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;
    const values = dataPoints.map(point => point.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const padding = Math.max((maxValue - minValue) * 0.15, maxValue * 0.05, 1);
    const minScale = Math.max(0, minValue - padding);
    const maxScale = maxValue + padding;
    const scaleRange = maxScale - minScale;
    const getX = index => dataPoints.length === 1
        ? left + plotWidth / 2
        : left + (index / (dataPoints.length - 1)) * plotWidth;
    const getY = value => top + ((maxScale - value) / scaleRange) * plotHeight;
    const tickCount = 4;
    const gridLines = Array.from({ length: tickCount + 1 }, (_, index) => {
        const y = top + (index / tickCount) * plotHeight;
        const value = maxScale - (index / tickCount) * scaleRange;
        return `
            <line class="statistics-grid-line" x1="${left}" y1="${y}" x2="${width - right}" y2="${y}"></line>
            <text class="statistics-axis-label" x="${left - 10}" y="${y + 4}" text-anchor="end">${value.toFixed(metric === "weight" ? 1 : 0)}</text>
        `;
    }).join("");
    const linePoints = dataPoints
        .map((point, index) => `${getX(index)},${getY(point.value)}`)
        .join(" ");
    const labelStep = Math.max(1, Math.ceil(dataPoints.length / 6));
    const points = dataPoints.map((point, index) => {
        const x = getX(index);
        const y = getY(point.value);
        const showDate = index % labelStep === 0 || index === dataPoints.length - 1;
        const displayValue = metric === "weight"
            ? `${point.value} kg`
            : `${point.value} sek.`;

        return `
            <circle class="statistics-point" cx="${x}" cy="${y}" r="5">
                <title>${escapeHtml(point.name)} — ${escapeHtml(formatDate(point.date))}: ${displayValue}</title>
            </circle>
            ${showDate
                ? `<text class="statistics-axis-label statistics-date-label" x="${x}" y="${height - 24}" text-anchor="middle">${escapeHtml(formatDate(point.date))}</text>`
                : ""}
        `;
    }).join("");

    exerciseWeightChart.innerHTML = `
        <svg class="statistics-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Wykres ${metric === "weight" ? "maksymalnego ciężaru" : "najdłuższego czasu"} dla ćwiczenia ${escapeHtml(exerciseName)} w kolejnych treningach">
            ${gridLines}
            <polyline class="statistics-chart-line" points="${linePoints}"></polyline>
            ${points}
            <text class="statistics-axis-title" x="16" y="${top + plotHeight / 2}" text-anchor="middle" transform="rotate(-90 16 ${top + plotHeight / 2})">${metric === "weight" ? "kg" : "sek."}</text>
        </svg>
    `;
}

function attachTrainingPlanLinks() {
    activeExercises
        .querySelectorAll("[data-open-training-plan]")
        .forEach(note => {
            note.addEventListener("click", event => {
                event.stopPropagation();
                openTrainingPlan(
                    note.dataset.openTrainingPlan,
                    note.dataset.planExerciseId
                );
            });

            note.addEventListener("keydown", event => {
                if (note.tagName === "BUTTON") return;
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                event.stopPropagation();
                openTrainingPlan(
                    note.dataset.openTrainingPlan,
                    note.dataset.planExerciseId
                );
            });
        });
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

if (isWorkoutsLoading) {

    resultsCount.textContent = "Ładowanie treningów...";
    workoutsList.innerHTML = `
        <div class="workout-loading" role="status" aria-live="polite">
            <span class="loading-spinner" aria-hidden="true"></span>
            <span>Pobieranie treningów...</span>
        </div>
    `;

    return;
}

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

const filteredCompetitions = competitions.filter(competition =>
    !exerciseFilterValue &&
    (
        !query ||
        competition.name.toLocaleLowerCase().includes(query)
    )
);

const entries = [
    ...filtered.map(workout => ({ ...workout, entryType: "workout" })),
    ...filteredCompetitions.map(competition => ({
        ...competition,
        entryType: "competition"
    }))
];

if (sortFilter.value === "newest") {
    entries.sort((a, b) => b.date.localeCompare(a.date));
} else if (sortFilter.value === "oldest") {
    entries.sort((a, b) => a.date.localeCompare(b.date));
} else if (sortFilter.value === "name") {
    entries.sort((a, b) => a.name.localeCompare(b.name, "pl"));
}

resultsCount.textContent =
    `${entries.length} ${entries.length === 1 ? "wpis" : "wpisów"}`;


if (!entries.length) {

    workoutsList.innerHTML = `
        <div class="workout-card">
            <p class="muted">
                Brak wpisów spełniających kryteria.
            </p>
        </div>
    `;

    return;
}


workoutsList.innerHTML =
    entries.map(entry => {
        if (entry.entryType === "competition") {
            return `
                <article
                    class="workout-card workout-card--competition"
                    data-competition-id="${escapeHtml(entry.id)}"
                    tabindex="0"
                    role="button"
                    aria-label="Otwórz zawody: ${escapeHtml(entry.name)}"
                >
                    <span class="competition-card-badge">ZAWODY</span>
                    <h3 class="workout-card-title">${escapeHtml(entry.name)}</h3>
                    <div class="workout-date">${formatDate(entry.date)}</div>
                </article>
            `;
        }

        const workout = entry;
        const relativeDateLabel = getRelativeDateLabel(workout.date);

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

        if (exerciseFilterValue) {
            return renderWorkoutExerciseHistory(workout, visibleExercises);
        }

        return `
            <article
                class="workout-card"
                data-id="${workout.id}"
            >

                <div class="workout-card-header">

                    <div>

                        <h3>
                            <span class="workout-card-title">${escapeHtml(workout.name)}</span>
                            ${workout.gym ? `<span class="workout-card-gym">${escapeHtml(workout.gym)}</span>` : ""}
                        </h3>

                        <div class="workout-date">
                            ${formatDate(workout.date)}
                            ${relativeDateLabel ? `<span class="relative-date-badge">${escapeHtml(relativeDateLabel)}</span>` : ""}
                        </div>

                    </div>

                </div>


                ${exerciseTags
                    ? `<div class="workout-exercises">
                        ${exerciseTags}
                       </div>`
                    : ""}

            </article>
        `;

    }).join("");

document
    .querySelectorAll(".workout-card[data-competition-id]")
    .forEach(card => {
        const openCompetitionCard = () =>
            openCompetition(card.dataset.competitionId);

        card.addEventListener("click", openCompetitionCard);
        card.addEventListener("keydown", event => {
            if (event.key !== "Enter" && event.key !== " ") return;

            event.preventDefault();
            openCompetitionCard();
        });
    });

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

function renderWorkoutExerciseHistory(workout, matchingExercises) {
    const relativeDateLabel = getRelativeDateLabel(workout.date);

    return `
        <article class="workout-card" data-id="${workout.id}">
            <div class="workout-card-header">
                <div>
                    <h3>
                        <span class="workout-card-title">${escapeHtml(workout.name)}</span>
                        ${workout.gym ? `<span class="workout-card-gym">${escapeHtml(workout.gym)}</span>` : ""}
                    </h3>
                    <div class="workout-date">
                        ${formatDate(workout.date)}
                        ${relativeDateLabel ? `<span class="relative-date-badge">${escapeHtml(relativeDateLabel)}</span>` : ""}
                    </div>
                </div>
            </div>
            <div class="exercise-history-compact">
                ${matchingExercises.map(exercise =>
                    renderExercise(
                        exercise,
                        0,
                        true,
                        false,
                        true,
                        canShowPlannedSetsForWorkout(workout)
                    )
                ).join("")}
            </div>
        </article>
    `;
}

/* OPEN WORKOUT */

function openWorkout(id, startEditing = false) {

    if (returnToWorkoutId !== null && id !== returnToWorkoutId) {
        returnToWorkoutId = null;
        updateReturnToWorkoutButton();
    }

    activeWorkoutId = id;

    setWorkoutEditing(Boolean(startEditing));
    isActiveWorkoutGymEditing = false;

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


    if (activeWorkoutEyebrow) {

        activeWorkoutEyebrow.textContent =
            workout.gym || "TRENING";

    }


    historyView.classList.add(
        "hidden"
    );

    weeklyView.classList.add(
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

    renderActiveWorkoutGymControl(workout);

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

    const workoutNotes = workout.notes || "";
    activeWorkoutNotes.value = workoutNotes;
    activeWorkoutNotesPreview.textContent =
        workoutNotes || "Brak notatek.";
    activeWorkoutNotesPreview.classList.toggle(
        "muted",
        !workoutNotes
    );
    activeWorkoutNotesPreview.classList.toggle(
        "hidden",
        isWorkoutEditing
    );
    activeWorkoutNotes.classList.toggle(
        "hidden",
        !isWorkoutEditing
    );

if (!workout.exercises.length) {
    const canOpenTrainingPlan = canOpenWorkoutTrainingPlan(workout);
    activeExercises.innerHTML = `
        <div class="workout-card workout-empty-state">
            <h3>Brak ćwiczeń</h3>
            <p class="muted">Dodaj pierwsze ćwiczenie do treningu.</p>
            <div class="workout-empty-actions">
                ${!isWorkoutEditing ? `
                    <button
                        type="button"
                        class="button button-secondary"
                        data-add-first-workout-exercise
                    >Dodaj ćwiczenie</button>
                ` : ""}
                ${canOpenTrainingPlan ? `
                    <button
                        type="button"
                        class="button button-secondary workout-plan-action"
                        data-open-training-plan="${escapeHtml(String(workout.id))}"
                    >Przejdź do planowania</button>
                ` : ""}
            </div>
        </div>
    `;

    const addFirstExerciseButton =
        activeExercises.querySelector("[data-add-first-workout-exercise]");

    if (addFirstExerciseButton) {
        addFirstExerciseButton.addEventListener("click", () => {
            setWorkoutEditing(true);
            renderActiveWorkout();
            addExercise();
        });
    }

    attachTrainingPlanLinks();
    return;
}


activeExercises.innerHTML =
    workout.exercises
        .map(
            (exercise, exerciseIndex) =>
                renderExercise(
                    exercise,
                    exerciseIndex,
                    false,
                    canOpenWorkoutTrainingPlan(workout),
                    false,
                    canShowPlannedSetsForWorkout(workout)
                )
        )
        .join("");


attachExerciseEvents();
attachExerciseHistoryLinks();
attachTrainingPlanLinks();
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

function getCompetitionLift(liftKey) {
    return COMPETITION_LIFTS.find(lift => lift.key === liftKey);
}

function openCompetition(competitionId) {
    const competition = competitions.find(
        item => item.id === competitionId
    );

    if (!competition) return;

    activeCompetitionId = competition.id;
    activeCompetitionName.textContent = competition.name;
    activeCompetitionDate.textContent = formatDate(competition.date);
    competitionNotes.value = competition.notes || "";
    competitionSaveStatus.textContent = "";

    historyView.classList.add("hidden");
    activeWorkoutView.classList.add("hidden");
    competitionView.classList.remove("hidden");

    renderCompetitionDetails(competition);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function renderCompetitionDetails(competition) {
    competitionLifts.innerHTML = COMPETITION_LIFTS
        .filter(lift => competition.lifts.some(item => item.liftKey === lift.key))
        .map(lift => {
            const competitionLift = competition.lifts.find(
                item => item.liftKey === lift.key
            );
            const attempts = competitionLift.attempts;

            return `
                <section class="competition-lift-card" data-lift-key="${lift.key}">
                    <h2>${lift.label}</h2>
                    <div class="competition-attempts">
                                ${attempts.map((attempt, index) => `
                            <div
                                class="competition-attempt-row"
                                data-result="${escapeHtml(attempt.result || "")}"
                            >
                                <label class="competition-attempt-weight">
                                    Podejście ${index + 1}
                                    <input
                                        class="competition-attempt-input"
                                        type="text"
                                        inputmode="decimal"
                                        placeholder="Ciężar (kg)"
                                        value="${attempt.weight === null || attempt.weight === undefined ? "" : escapeHtml(String(attempt.weight))}"
                                    >
                                </label>
                                <div class="competition-attempt-result">
                                    <button
                                        type="button"
                                        class="competition-result-button competition-result-button--success"
                                        data-result="success"
                                        aria-label="Podejście ${index + 1} zaliczone"
                                        aria-pressed="${attempt.result === "success"}"
                                    >✓</button>
                                    <button
                                        type="button"
                                        class="competition-result-button competition-result-button--failed"
                                        data-result="failed"
                                        aria-label="Podejście ${index + 1} spalone"
                                        aria-pressed="${attempt.result === "failed"}"
                                    >×</button>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                    <label class="form-field competition-lift-notes">
                        Notatki do boju
                        <textarea
                            class="competition-lift-notes-input"
                            rows="3"
                            placeholder="Notatki do ${lift.label.toLocaleLowerCase()}..."
                        >${escapeHtml(competitionLift.notes || "")}</textarea>
                    </label>
                </section>
            `;
        }).join("");

    updateCompetitionTotal();
}

function updateCompetitionTotal() {
    const total = [...competitionLifts.querySelectorAll(".competition-lift-card")]
        .reduce((sum, liftCard) => {
            const successfulWeights = [
                ...liftCard.querySelectorAll('.competition-attempt-row[data-result="success"]')
            ]
                .map(row => row.querySelector("input").value)
                .map(parseNumericInput)
                .filter(Number.isFinite);

            return sum + (successfulWeights.length ? Math.max(...successfulWeights) : 0);
        }, 0);

    competitionTotal.textContent = `${Number.isInteger(total) ? total : total.toFixed(1)} kg`;
}

addCompetitionButton.addEventListener("click", () => {
    competitionForm.reset();
    competitionDate.value = formatDate(getTodayInternal());
    competitionDialog.showModal();
});

closeCompetitionDialogButton.addEventListener(
    "click",
    () => competitionDialog.close()
);

cancelCompetitionButton.addEventListener(
    "click",
    () => competitionDialog.close()
);

backFromCompetitionButton.addEventListener("click", () => {
    activeCompetitionId = null;
    competitionView.classList.add("hidden");
    historyView.classList.remove("hidden");
    refreshApp();
});

competitionLifts.addEventListener("input", updateCompetitionTotal);

competitionLifts.addEventListener("click", event => {
    const button = event.target.closest(".competition-result-button");
    if (!button) return;

    const attemptRow = button.closest(".competition-attempt-row");
    const result = attemptRow.dataset.result === button.dataset.result
        ? ""
        : button.dataset.result;
    attemptRow.dataset.result = result;

    attemptRow.querySelectorAll(".competition-result-button").forEach(resultButton => {
        resultButton.setAttribute(
            "aria-pressed",
            String(resultButton.dataset.result === result)
        );
    });

    updateCompetitionTotal();
});

competitionForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (createCompetitionButton.disabled) return;

    const date = parseUserDate(competitionDate.value);
    const name = competitionName.value.trim();
    const selectedLiftKeys = [
        ...competitionForm.querySelectorAll('input[name="competitionLift"]:checked')
    ].map(input => input.value);

    if (!date) {
        alert("Wpisz poprawną datę w formacie DD/MM/RRRR.");
        return;
    }

    if (!name) {
        alert("Wpisz nazwę zawodów.");
        return;
    }

    if (!selectedLiftKeys.length) {
        alert("Wybierz przynajmniej jeden bój.");
        return;
    }

    createCompetitionButton.disabled = true;

    try {
        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("Musisz być zalogowany.");

        const {
            data,
            error
        } = await supabaseClient
            .from("competitions")
            .insert({
                user_id: user.id,
                name,
                competition_date: date,
                notes: ""
            })
            .select()
            .single();

        if (error) throw error;

        const initialAttempts = Array.from(
            { length: 3 },
            () => ({ weight: null, result: null })
        );
        const liftsToInsert = selectedLiftKeys.map(liftKey => ({
            competition_id: data.id,
            lift_key: liftKey,
            attempts: initialAttempts,
            notes: ""
        }));

        const { error: liftsError } = await supabaseClient
            .from("competition_lifts")
            .insert(liftsToInsert);

        if (liftsError) {
            const { error: cleanupError } = await supabaseClient
                .from("competitions")
                .delete()
                .eq("id", data.id);

            if (cleanupError) {
                console.error("Nie udało się usunąć niekompletnych zawodów:", cleanupError);
            }
            throw liftsError;
        }

        const competition = {
            id: data.id,
            name: data.name,
            date: data.competition_date,
            notes: data.notes || "",
            lifts: liftsToInsert.map((lift, index) => ({
                id: `${data.id}-${index}`,
                liftKey: lift.lift_key,
                attempts: initialAttempts.map(attempt => ({ ...attempt })),
                notes: lift.notes
            }))
        };

        competitions.push(competition);
        competitionDialog.close();
        refreshApp();
        openCompetition(competition.id);
    } catch (error) {
        console.error("Błąd tworzenia zawodów:", error);
        alert(error.message || "Nie udało się utworzyć zawodów.");
    } finally {
        createCompetitionButton.disabled = false;
    }
});

saveCompetitionButton.addEventListener("click", async () => {
    const competition = competitions.find(
        item => item.id === activeCompetitionId
    );
    if (!competition || saveCompetitionButton.disabled) return;

    const liftRows = [
        ...competitionLifts.querySelectorAll(".competition-lift-card")
    ];
    const updates = [];
    let invalidAttempt = null;

    for (const liftCard of liftRows) {
        const liftKey = liftCard.dataset.liftKey;
        const attempts = [
            ...liftCard.querySelectorAll(".competition-attempt-row")
        ].map((row, index) => {
            const value = row.querySelector("input").value.trim();
            const weight = parseNumericInput(value);

            if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
                invalidAttempt =
                    `${getCompetitionLift(liftKey).label}, podejście ${index + 1}: wpisz poprawny ciężar.`;
            }

            return {
                weight,
                result: row.dataset.result || null
            };
        });

        updates.push({
            competition_id: competition.id,
            lift_key: liftKey,
            attempts,
            notes: liftCard.querySelector(".competition-lift-notes-input").value.trim()
        });
    }

    if (invalidAttempt) {
        alert(invalidAttempt);
        return;
    }

    saveCompetitionButton.disabled = true;
    competitionSaveStatus.textContent = "Zapisywanie...";

    try {
        const { error: liftsError } = await supabaseClient
            .from("competition_lifts")
            .upsert(updates, { onConflict: "competition_id,lift_key" });

        if (liftsError) throw liftsError;

        const notes = competitionNotes.value.trim();
        const { error: competitionError } = await supabaseClient
            .from("competitions")
            .update({ notes })
            .eq("id", competition.id);

        if (competitionError) throw competitionError;

        competition.lifts = updates.map(update => {
            const existingLift = competition.lifts.find(
                lift => lift.liftKey === update.lift_key
            );

            return {
                id: existingLift?.id,
                liftKey: update.lift_key,
                attempts: update.attempts,
                notes: update.notes
            };
        });

        competition.notes = notes;
        competitionSaveStatus.textContent = "Wyniki zapisane.";
    } catch (error) {
        console.error("Błąd zapisu wyników zawodów:", error);
        competitionSaveStatus.textContent = "";
        alert(error.message || "Nie udało się zapisać wyników zawodów.");
    } finally {
        saveCompetitionButton.disabled = false;
    }
});

function renderSetFieldControl(field, set, attributes = "") {
    const definition = FIELD_DEFINITIONS[field];

    if (!definition) {
        console.error(`Brak definicji pola serii: ${field}`);
        return "";
    }

    if (definition.type === "select") {
        return `
            <select class="set-field set-${field}" data-field="${field}" ${attributes}>
                <option value="">Wybierz</option>
                ${definition.options.map(option => `
                    <option value="${escapeHtml(option)}" ${set[field] === option ? "selected" : ""}>
                        ${escapeHtml(option)}
                    </option>
                `).join("")}
            </select>
        `;
    }

    return `
        <input
            class="set-field set-${field}"
            data-field="${field}"
            ${attributes}
            type="${definition.type}"
            inputmode="${definition.inputmode}"
            ${definition.type === "number" && definition.step ? `step="${definition.step}"` : ""}
            placeholder="${escapeHtml(definition.placeholder)}"
            value="${escapeHtml(String(set[field] ?? ""))}"
        >
    `;
}

function renderSetFieldHeaders(fields) {
    return fields.map(field => {
        const definition = FIELD_DEFINITIONS[field];
        if (!definition) {
            console.error(`Brak definicji pola serii: ${field}`);
            return "";
        }

        return `
            <div class="set-header-${field}">
                <span class="set-header-label">${escapeHtml(definition.label)}</span>
                ${field === "reps"
                    ? '<span class="set-header-label-mobile">Powt.</span>'
                    : ""}
            </div>
        `;
    }).join("");
}

function getSetMobileColumns(fields) {
    return [
        "32px",
        ...fields.map(field => {
            const definition = FIELD_DEFINITIONS[field];
            if (definition?.type === "select") {
                if (field === "setType") return "72px";
                if (field === "deadliftStyle") return "100px";
                return "96px";
            }
            return "56px";
        }),
        "28px"
    ].join(" ");
}

function renderPlannedSetsNote(exercise, fields, isClickable = false) {
    const plannedSets = Array.isArray(exercise.plannedSets)
        ? exercise.plannedSets
        : [];
    const visibleSets = plannedSets
        .map((set, index) => {
            const hasValue = field =>
                set[field] !== "" &&
                set[field] !== null &&
                set[field] !== undefined;
            const primary = [];

            if (hasValue("weight")) primary.push(`${escapeHtml(String(set.weight))} kg`);
            if (hasValue("reps")) primary.push(escapeHtml(String(set.reps)));
            if (hasValue("rpe")) {
                primary.push(`@${escapeHtml(String(set.rpe))}`);
            }

            const secondary = [];
            if (hasValue("seconds")) secondary.push(`${escapeHtml(String(set.seconds))} s`);
            if (hasValue("minutes")) secondary.push(`${escapeHtml(String(set.minutes))} min`);
            if (hasValue("load")) secondary.push(`+${escapeHtml(String(set.load))}`);

            ["band", "setType", "deadliftStyle"].forEach(field => {
                if (fields.includes(field) && hasValue(field)) {
                    secondary.push(escapeHtml(String(set[field])));
                }
            });

            const primaryText = primary.length > 1 && hasValue("rpe")
                ? `${primary.slice(0, -1).join(" × ")} ${primary[primary.length - 1]}`
                : primary.join(" × ");
            const values = [primaryText, ...secondary].filter(Boolean);

            return { index, values };
        })
        .filter(set => set.values.length);

    if (!visibleSets.length) return "";

    const planNavigation = isClickable && activeWorkoutId !== null
        ? `data-open-training-plan="${escapeHtml(String(activeWorkoutId))}" data-plan-exercise-id="${escapeHtml(String(exercise.id))}" role="button" tabindex="0" aria-label="Otwórz plan dla ${escapeHtml(exercise.name)}"`
        : "";

    return `
        <aside class="exercise-planned-sets" ${planNavigation} aria-label="Planowane serie">
            <h3>Plan na trening</h3>
            <p class="exercise-planned-sets-help">Cel treningowy · nie są to wykonane serie</p>
            <ol>
                ${visibleSets.map(set => `
                    <li><span class="exercise-planned-set-number">${set.index + 1}.</span> ${set.values.join(" · ")}</li>
                `).join("")}
            </ol>
        </aside>
    `;
}

function renderExercise(
    exercise,
    exerciseIndex,
    highlightMaxWeight = false,
    canOpenTrainingPlan = false,
    readOnly = false,
    showPlannedSets = true
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

    const planActionButton = canOpenTrainingPlan && !hasPlannedSets(exercise)
        ? `
            <button
                type="button"
                class="button button-secondary workout-plan-action"
                data-open-training-plan="${escapeHtml(String(activeWorkoutId))}"
                data-plan-exercise-id="${escapeHtml(String(exercise.id))}"
            >Przejdź do planowania</button>
        `
        : "";

    /* PODGLĄD */

    if (readOnly || !isWorkoutEditing) {

        const groupedSets = [];

        const hasValue = value =>
            value !== null &&
            value !== undefined &&
            String(value).trim() !== "";

        const canGroupSet = set =>
            hasValue(set.weight) &&
            hasValue(set.reps);

        const setsHaveSameValues = (first, second) => {
            const fields = new Set([
                ...Object.keys(first),
                ...Object.keys(second)
            ]);
            fields.delete("id");

            return [...fields].every(field => {
                const firstValue = first[field];
                const secondValue = second[field];
                const firstHasValue = hasValue(firstValue);
                const secondHasValue = hasValue(secondValue);

                if (!firstHasValue || !secondHasValue) {
                    return firstHasValue === secondHasValue;
                }

                if (NUMERIC_SET_FIELDS.includes(field)) {
                    const firstNumber = Number(firstValue);
                    const secondNumber = Number(secondValue);
                    return Number.isFinite(firstNumber) &&
                        Number.isFinite(secondNumber) &&
                        firstNumber === secondNumber;
                }

                return String(firstValue) === String(secondValue);
            });
        };

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

            if (
                lastGroup &&
                lastGroup.type === type &&
                (type !== "" || groupIdenticalSets)
            ) {
                lastGroup.items.push({ set, setIndex });
                return;
            }

            groupedSets.push({
                type,
                items: [{ set, setIndex }]
            });
        });

        let hasAggregatedSets = false;
        const setRows =
            groupedSets.map((group) => {
                const itemsToRender = group.items.reduce((items, item) => {
                    const previous = items[items.length - 1];
                    if (
                        groupIdenticalSets &&
                        previous &&
                        previous.count &&
                        canGroupSet(previous.set) &&
                        canGroupSet(item.set) &&
                        setsHaveSameValues(previous.set, item.set)
                    ) {
                        previous.count += 1;
                        return items;
                    }

                    if (
                        groupIdenticalSets &&
                        previous &&
                        !previous.count &&
                        canGroupSet(previous.set) &&
                        canGroupSet(item.set) &&
                        setsHaveSameValues(previous.set, item.set)
                    ) {
                        previous.count = 2;
                        return items;
                    }

                    items.push({ ...item, count: 0 });
                    return items;
                }, []);
                if (itemsToRender.some(({ count }) => count > 1)) {
                    hasAggregatedSets = true;
                }

                const rowsHtml = itemsToRender.map(({ set, setIndex, count }) => {
                    const numericWeight = getNumericWeight(set);
                    const isMaxWeightSet = maxWeight !== null && numericWeight !== null && Math.abs(numericWeight - maxWeight) < 1e-9;
                    const lastTwoDigits = count % 100;
                    const countNoun = count % 10 >= 2 &&
                        count % 10 <= 4 &&
                        (lastTwoDigits < 12 || lastTwoDigits > 14)
                        ? "serie"
                        : "serii";

                    const primaryBits = [];
                    if (set.weight !== "" && set.weight !== null && set.weight !== undefined) {
                        primaryBits.push(`${set.weight} kg`);
                    }
                    if (set.reps !== "" && set.reps !== null && set.reps !== undefined) {
                        primaryBits.push(`${set.reps}`);
                    }

                    const hasWeightOrReps = primaryBits.length > 0;
                    const fallbackPrimaryBits = [];

                    if (!hasWeightOrReps) {
                        if (set.seconds !== "" && set.seconds !== null && set.seconds !== undefined) {
                            fallbackPrimaryBits.push(`${set.seconds} s`);
                        }

                        if (set.minutes !== "" && set.minutes !== null && set.minutes !== undefined) {
                            fallbackPrimaryBits.push(`${set.minutes} min`);
                        }

                        if (
                            !fallbackPrimaryBits.length &&
                            set.load !== "" &&
                            set.load !== null &&
                            set.load !== undefined
                        ) {
                            fallbackPrimaryBits.push(`${set.load}`);
                        }
                    }

                    const secondaryBits = [];

                    if (set.band !== "" && set.band !== null && set.band !== undefined) {
                        secondaryBits.push(`Guma: ${set.band}`);
                    }

                    if (hasWeightOrReps && set.seconds !== "" && set.seconds !== null && set.seconds !== undefined) {
                        secondaryBits.push(`${set.seconds} sek.`);
                    }

                    if (hasWeightOrReps && set.minutes !== "" && set.minutes !== null && set.minutes !== undefined) {
                        secondaryBits.push(`${set.minutes} min`);
                    }

                    if (
                        (hasWeightOrReps || fallbackPrimaryBits.length > 0) &&
                        set.load !== "" &&
                        set.load !== null &&
                        set.load !== undefined
                    ) {
                        secondaryBits.push(`Obciążenie: ${set.load}`);
                    }

                    const primaryText =
                        hasWeightOrReps
                            ? (() => {
                                const repsIndex = primaryBits.lastIndexOf(`${set.reps}`);
                                const parts = [...primaryBits];

                                if (set.rpe !== "" && set.rpe !== null && set.rpe !== undefined && repsIndex >= 0) {
                                    parts[repsIndex] = `${set.reps} @${set.rpe}`;
                                }

                                return parts.join(" × ");
                            })()
                            : fallbackPrimaryBits.length
                                ? fallbackPrimaryBits.join(" · ")
                                : "—";

                    return `
                        <div class="workout-view-set ${isMaxWeightSet ? "workout-view-set--max-weight" : ""}">

                            <span class="workout-view-set-number">
                                ${setIndex + 1}.
                                ${count > 1 ? `<span class="workout-view-set-count">${count} ${countNoun}</span>` : ""}
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
                    group.type && !highlightMaxWeight
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
        const plannedSetsNote = showPlannedSets
            ? renderPlannedSetsNote(exercise, fields, canOpenTrainingPlan)
            : "";


        return `
            <section class="workout-view-exercise ${hasAggregatedSets ? "workout-view-exercise--grouped" : ""}">

                <h2
                    class="exercise-name-trigger"
                    data-exercise-history-name="${escapeHtml(exercise.name)}"
                    tabindex="0"
                    role="button"
                >
                    ${exercise.name}
                </h2>

                ${setRows}

                ${plannedSetsNote}

                ${notes}

                ${planActionButton}

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

                        ${fields.map(field => renderSetFieldControl(field, set)).join("")}

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


    const headerFields = renderSetFieldHeaders(fields);
    const mobileSetColumns = getSetMobileColumns(fields);
    const plannedSetsNote = showPlannedSets
        ? renderPlannedSetsNote(exercise, fields, canOpenTrainingPlan)
        : "";
    return `
        <section class="active-exercise">

            <div class="exercise-header">

                <div class="exercise-title">

                    <div class="exercise-order-controls">
                        <button
                            type="button"
                            class="move-exercise"
                            data-exercise-index="${exerciseIndex}"
                            data-direction="-1"
                            aria-label="Przesuń ${escapeHtml(exercise.name)} wyżej"
                            title="Przesuń wyżej"
                            ${exerciseIndex === 0 || isExerciseOrderSaving ? "disabled" : ""}
                        >↑</button>
                        <button
                            type="button"
                            class="move-exercise"
                            data-exercise-index="${exerciseIndex}"
                            data-direction="1"
                            aria-label="Przesuń ${escapeHtml(exercise.name)} niżej"
                            title="Przesuń niżej"
                            ${exerciseIndex === workouts.find(workout => workout.id === activeWorkoutId).exercises.length - 1 || isExerciseOrderSaving ? "disabled" : ""}
                        >↓</button>
                    </div>

                    <h2>
                        <button
                            type="button"
                            class="exercise-name-trigger"
                            data-exercise-history-name="${escapeHtml(exercise.name)}"
                        >
                            ${escapeHtml(exercise.name)}
                        </button>
                    </h2>

                </div>

                <button
                    type="button"
                    class="remove-exercise"
                    data-exercise-index="${exerciseIndex}"
                >
                    Usuń ćwiczenie
                </button>

            </div>
            <div class="exercise-set-planning-layout ${plannedSetsNote ? "has-planned-sets" : ""}">
                <div class="exercise-set-editor">
                    <h3 class="exercise-set-editor-heading">Wykonane serie</h3>
                    <div
                        class="set-fields-scroll"
                        style="--set-mobile-columns: ${mobileSetColumns}"
                    >

                        <div class="set-row set-header">

                            <div>SERIA</div>

                            ${headerFields}

                            <div></div>

                        </div>

                        ${rows}

                    </div>
                    <button
                        type="button"
                        class="add-set-button"
                        data-exercise-index="${exerciseIndex}"
                    >
                        + Dodaj serię
                    </button>
                </div>
                ${plannedSetsNote}
            </div>
            ${planActionButton}

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
        </section>
    `;

}

function startInlineWorkoutEdit(
    container,
    field,
    value
) {

    if (field === "gym") {

        const workout =
            workouts.find(
                item => item.id === activeWorkoutId
            );

        if (!workout) return;

        isActiveWorkoutGymEditing = true;
        renderActiveWorkoutGymControl(workout);
        activeWorkoutGymSelect.focus();
        return;
    }

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
                : type === "date"
                    ? workout.date
                    : workout.gymId
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

                } catch (error) {

                    console.error(
                        "Błąd dodawania serii:",
                        error
                    );

                    alert(
                        "Nie udało się zapisać serii. Sprawdź połączenie i spróbuj ponownie."
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
    .querySelectorAll(".move-exercise")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {
                moveExercise(
                    Number(button.dataset.exerciseIndex),
                    Number(button.dataset.direction)
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

    const previousSet =
        exercise.sets[exercise.sets.length - 1];
    const sbdExerciseBaseName =
        getSbdExerciseBaseName(exercise.name);

    if (
        previousSet &&
        (
            sbdExerciseBaseName ||
            config?.fields?.includes("setType")
        )
    ) {
        setData.setType = previousSet.setType || "";

        if (
            sbdExerciseBaseName === "deadlift" ||
            config?.fields?.includes("deadliftStyle")
        ) {
            setData.deadliftStyle = previousSet.deadliftStyle || "";
        }
    }


    /*
     * Znajdź ostatnią serię,
     * żeby ustawić kolejny numer
     */

    const setOrder =
        exercise.sets.length;

    const existingSetIds = new Set(
        exercise.sets
            .map(set => set.id)
            .filter(Boolean)
    );


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


    const {
        data: savedSets,
        error: verificationError
    } =
        await supabaseClient
            .from("sets")
            .select("id, data, set_order")
            .eq(
                "workout_exercise_id",
                exercise.id
            )
            .order("set_order");

    if (verificationError) {

        console.error(
            "Nie udało się zweryfikować serii po zapisie:",
            verificationError
        );

        exercise.sets.push({
            id: data.id,
            ...setData
        });

        alert(
            "Seria została wysłana, ale nie udało się potwierdzić jej zapisu w bazie. Sprawdź trening po ponownym wczytaniu."
        );

    } else {

        const savedSetIds = new Set(
            savedSets.map(set => set.id)
        );

        const missingExistingSets =
            [...existingSetIds].some(
                setId => !savedSetIds.has(setId)
            );

        const newSetWasSaved =
            savedSetIds.has(data.id);

        exercise.sets = savedSets.map(set => ({
            id: set.id,
            ...set.data
        }));

        if (missingExistingSets || !newSetWasSaved) {

            console.error(
                "Niezgodność serii po zapisie:",
                {
                    missingExistingSets,
                    newSetWasSaved,
                    insertedSetId: data.id,
                    savedSets
                }
            );

            alert(
                missingExistingSets
                    ? "Baza danych nie zachowała wcześniejszej serii podczas dodawania. Widok został zsynchronizowany z bazą. Sprawdź ograniczenia lub triggery tabeli sets."
                    : "Baza danych nie zachowała dodanej serii. Widok został zsynchronizowany z bazą. Sprawdź ograniczenia lub triggery tabeli sets."
            );
        }
    }


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

        if (!isWorkoutEditing) return;

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

    const parsedValue = parseNumericInput(input.value);

    if (
        NUMERIC_SET_FIELDS.includes(field) &&
        input.value.trim() !== "" &&
        !Number.isFinite(parsedValue)
    ) {
        alert("Wpisz poprawną liczbę. Możesz użyć przecinka lub kropki.");
        input.value = set[field] ?? "";
        return;
    }

    if (
        field === "load" &&
        parsedValue !== null &&
        !Number.isInteger(parsedValue)
    ) {
        alert(
            "Obciążenie musi być liczbą całkowitą."
        );

        input.value = set[field] ?? "";
        return;
    }


    /*
     * Aktualizuj lokalny obiekt
     */

    const previousValue = set[field];
    const nextValue =
        NUMERIC_SET_FIELDS.includes(field) && input.value.trim() !== ""
            ? parsedValue
            : input.value;

    set[field] = nextValue;


    /*
     * Seria musi mieć ID z Supabase
     */

    if (!set.id) {

        console.error(
            "Brak ID serii w Supabase."
        );

        set[field] = previousValue;
        input.value = previousValue ?? "";

        alert(
            "Nie można zapisać tej serii. Odśwież trening i spróbuj ponownie."
        );

        return;
    }


    const setId = set.id;
    const previousSave =
        pendingSetSaveQueues.get(setId) ||
        Promise.resolve();

    const savePromise = previousSave
        .catch(() => {})
        .then(async () => {

            const setData = {
                ...set
            };

            delete setData.id;

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("sets")
                    .update({
                        data: setData
                    })
                    .eq(
                        "id",
                        setId
                    )
                    .select("id")
                    .maybeSingle();

            if (error) throw error;

            if (!data) {
                throw new Error(
                    "Seria nie została znaleziona lub zapis został zablokowany."
                );
            }
        });

    pendingSetSaveQueues.set(
        setId,
        savePromise
    );

    try {

        await savePromise;

    } catch (error) {

        console.error(
            "Błąd zapisu serii:",
            error
        );

        if (set[field] === nextValue) {
            set[field] = previousValue;
            input.value = previousValue ?? "";
        }

        alert(
            "Nie udało się zapisać serii. Niepotwierdzona zmiana została cofnięta. Sprawdź połączenie i spróbuj ponownie."
        );

    } finally {

        if (
            pendingSetSaveQueues.get(setId) ===
            savePromise
        ) {
            pendingSetSaveQueues.delete(setId);
        }
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

async function moveExercise(exerciseIndex, direction) {

    if (isExerciseOrderSaving) return;

    const workout =
        workouts.find(
            workout => workout.id === activeWorkoutId
        );

    if (!workout) return;

    const targetIndex = exerciseIndex + direction;

    if (targetIndex < 0 || targetIndex >= workout.exercises.length) return;

    const previousExercises = [...workout.exercises];
    [workout.exercises[exerciseIndex], workout.exercises[targetIndex]] =
        [workout.exercises[targetIndex], workout.exercises[exerciseIndex]];

    isExerciseOrderSaving = true;
    renderActiveWorkout();

    try {
        const updates = await Promise.all(
            workout.exercises.map((exercise, order) =>
                supabaseClient
                    .from("workout_exercises")
                    .update({ exercise_order: order })
                    .eq("id", exercise.id)
            )
        );

        const failedUpdate = updates.find(result => result.error);
        if (failedUpdate) throw failedUpdate.error;
    } catch (error) {
        console.error("Błąd zmiany kolejności ćwiczeń:", error);
        workout.exercises = previousExercises;

        await Promise.all(
            previousExercises.map((exercise, order) =>
                supabaseClient
                    .from("workout_exercises")
                    .update({ exercise_order: order })
                    .eq("id", exercise.id)
            )
        );

        alert("Nie udało się zapisać kolejności ćwiczeń.");
    } finally {
        isExerciseOrderSaving = false;
        renderActiveWorkout();
    }
}

/* NEW WORKOUT */

function openNewWorkoutDialog(fromTrainingPlan = false) {

isCreatingWorkoutFromPlan = fromTrainingPlan;

workoutForm.reset();

workoutDate.value =
    formatDate(
        getTodayInternal()
    );
syncDatePickerFromText(workoutDate, workoutDatePicker);

workoutDialog.showModal();

workoutName.focus();


}

document
    .querySelectorAll("[data-workout-date-offset]")
    .forEach(button => {
        button.addEventListener("click", () => {
            const daysToAdd = Number(button.dataset.workoutDateOffset);
            const date = new Date();
            date.setDate(date.getDate() + daysToAdd);

            workoutDate.value = [
                String(date.getDate()).padStart(2, "0"),
                String(date.getMonth() + 1).padStart(2, "0"),
                date.getFullYear()
            ].join("/");
            syncDatePickerFromText(workoutDate, workoutDatePicker);
        });
    });

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
        const createdFromPlan = isCreatingWorkoutFromPlan;
        isCreatingWorkoutFromPlan = false;
        saveWorkoutButton.disabled = false;


        workoutDialog.close();


        refreshApp();

        if (createdFromPlan) {
            openTrainingPlan(newWorkout.id);
        } else {
            openWorkout(
                newWorkout.id,
                true
            );
        }

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

            plannedSets: [],

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

recordsViewButton.addEventListener(
    "click",
    () => {
        historyView.classList.add("hidden");
        exercisesView.classList.add("hidden");
        exerciseConfigView.classList.add("hidden");
        gymsView.classList.add("hidden");
        weeklyView.classList.add("hidden");
        statisticsView.classList.add("hidden");
        rareExercisesView.classList.add("hidden");
        settingsView.classList.add("hidden");
        recordsView.classList.remove("hidden");

        renderSbdRecords();
    }
);

backToHistoryFromRecordsButton.addEventListener(
    "click",
    () => {
        recordsView.classList.add("hidden");
        historyView.classList.remove("hidden");
    }
);

function renderHomeShortcutSettings() {
    homeShortcutsSetting.innerHTML = HOME_SHORTCUT_OPTIONS.map(option => `
        <label class="settings-checkbox home-shortcut-option">
            <input
                type="checkbox"
                value="${option.id}"
                ${draftHomeShortcutIds.includes(option.id) ? "checked" : ""}
            >
            <span>${option.label}</span>
        </label>
    `).join("");
    updateHomeShortcutOptionAvailability();
}

function canOpenWorkoutTrainingPlan(workout) {
    return workout.date >= getTodayInternal();
}

function canShowPlannedSetsForWorkout(workout) {
    return canOpenWorkoutTrainingPlan(workout) || showPastTrainingPlans;
}

async function saveUserSettings(updates) {
    if (!currentUserId) {
        throw new Error("Brak zalogowanego użytkownika.");
    }

    const { error } = await supabaseClient
        .from("user_settings")
        .upsert({
            user_id: currentUserId,
            group_identical_sets: groupIdenticalSets,
            show_past_training_plans: showPastTrainingPlans,
            home_shortcut_ids: homeShortcutIds,
            rare_exercises_workout_count: rareExercisesWorkoutLimit,
            ...updates
        }, { onConflict: "user_id" });
    if (error) throw error;
}

function loadPastTrainingPlanPreference(value) {
    showPastTrainingPlans = value === true;
    showPastTrainingPlansSetting.checked = showPastTrainingPlans;
    pastTrainingPlansStatus.textContent = "";
}

showPastTrainingPlansSetting.addEventListener("change", async () => {
    if (!currentUserId) {
        showPastTrainingPlansSetting.checked = showPastTrainingPlans;
        pastTrainingPlansStatus.textContent =
            "Zaloguj się ponownie, aby zapisać ustawienie.";
        return;
    }

    const nextValue = showPastTrainingPlansSetting.checked;
    showPastTrainingPlansSetting.disabled = true;
    pastTrainingPlansStatus.textContent = "Zapisywanie ustawienia...";
    try {
        await saveUserSettings({ show_past_training_plans: nextValue });
        showPastTrainingPlans = nextValue;
        pastTrainingPlansStatus.textContent = "Ustawienie zapisane.";
        if (activeWorkoutId !== null) renderActiveWorkout();
    } catch (error) {
        console.error("Błąd zapisu ustawienia planów przeszłych treningów:", error);
        showPastTrainingPlansSetting.checked = showPastTrainingPlans;
        pastTrainingPlansStatus.textContent = "Nie udało się zapisać ustawienia.";
    } finally {
        showPastTrainingPlansSetting.disabled = false;
    }
});

function updateHomeShortcutOptionAvailability() {
    const hasFourSelected = draftHomeShortcutIds.length === 4;
    homeShortcutsSetting
        .querySelectorAll('input[type="checkbox"]')
        .forEach(input => {
            input.disabled =
                hasFourSelected && !draftHomeShortcutIds.includes(input.value);
        });
}

function applyHomeShortcuts(ids) {
    if (ids.length !== 4 || new Set(ids).size !== 4) {
        throw new Error("Należy wybrać dokładnie 4 skróty.");
    }

    const selectedIds = new Set(ids);
    const headerActions = document.querySelector("#historyView .header-actions");
    const headerMenu = document.querySelector("#headerMenu");
    const headerMenuItems = document.querySelector("#headerMenu .header-menu-items");
    if (!headerActions || !headerMenu || !headerMenuItems) {
        throw new Error("Nie znaleziono elementów menu głównego.");
    }

    ids.forEach(id => {
        const button = document.getElementById(id);
        if (!button) throw new Error(`Nie znaleziono przycisku ${id}.`);
        headerActions.insertBefore(button, headerMenu);
    });

    HEADER_MENU_ITEM_ORDER.forEach(id => {
        const item = document.getElementById(id);
        if (!item) throw new Error(`Nie znaleziono elementu menu ${id}.`);
        if (id === "settingsViewButton" || !selectedIds.has(id)) {
            headerMenuItems.append(item);
        }
    });
}

function loadHomeShortcutPreferences(savedIds) {
    const availableIds = new Set(HOME_SHORTCUT_OPTIONS.map(option => option.id));
    homeShortcutIds =
        Array.isArray(savedIds) &&
        savedIds.length === 4 &&
        new Set(savedIds).size === 4 &&
        savedIds.every(id => availableIds.has(id))
            ? savedIds
            : [...DEFAULT_HOME_SHORTCUT_IDS];
    draftHomeShortcutIds = [...homeShortcutIds];
    applyHomeShortcuts(homeShortcutIds);
    renderHomeShortcutSettings();
    homeShortcutsStatus.textContent = "";
}

function getCachedHomeShortcutPreferences(userId) {
    if (!userId) return null;

    try {
        const cachedIds = JSON.parse(
            localStorage.getItem(`training-log-home-shortcuts-cache:${userId}`)
        );
        const availableIds = new Set(HOME_SHORTCUT_OPTIONS.map(option => option.id));
        return Array.isArray(cachedIds) &&
            cachedIds.length === 4 &&
            new Set(cachedIds).size === 4 &&
            cachedIds.every(id => availableIds.has(id))
            ? cachedIds
            : null;
    } catch (error) {
        console.error("Błąd odczytu zapisanego układu przycisków:", error);
        return null;
    }
}

function cacheHomeShortcutPreferences(userId, shortcutIds) {
    if (!userId) return;

    try {
        localStorage.setItem(
            `training-log-home-shortcuts-cache:${userId}`,
            JSON.stringify(shortcutIds)
        );
    } catch (error) {
        console.error("Błąd zapisu układu przycisków w przeglądarce:", error);
    }
}

async function migrateLegacyUserSettings() {
    if (!currentUserId) return;

    const updates = {};
    const migratedKeys = [];
    const originalPastPlans = showPastTrainingPlans;
    const originalShortcuts = [...homeShortcutIds];
    const originalWorkoutCount = rareExercisesWorkoutLimit;
    let migratedPastPlans = showPastTrainingPlans;
    let migratedShortcuts = [...homeShortcutIds];
    let migratedWorkoutCount = rareExercisesWorkoutLimit;
    try {
        const savedPastPlans = localStorage.getItem(
            `training-log-show-past-plans:${currentUserId}`
        );
        if (savedPastPlans === "true" || savedPastPlans === "false") {
            migratedPastPlans = savedPastPlans === "true";
            updates.show_past_training_plans = migratedPastPlans;
            migratedKeys.push(`training-log-show-past-plans:${currentUserId}`);
        }

        const savedShortcuts = localStorage.getItem(
            `training-log-home-shortcuts:${currentUserId}`
        );
        if (savedShortcuts !== null) {
            const parsedShortcuts = JSON.parse(savedShortcuts);
            const availableIds = new Set(HOME_SHORTCUT_OPTIONS.map(option => option.id));
            if (
                Array.isArray(parsedShortcuts) &&
                parsedShortcuts.length === 4 &&
                new Set(parsedShortcuts).size === 4 &&
                parsedShortcuts.every(id => availableIds.has(id))
            ) {
                migratedShortcuts = parsedShortcuts;
                updates.home_shortcut_ids = migratedShortcuts;
                migratedKeys.push(`training-log-home-shortcuts:${currentUserId}`);
            }
        }

        const savedCount = localStorage.getItem(
            `training-log-rare-exercises-workout-count:${currentUserId}`
        );
        const parsedCount = Number(savedCount);
        if (savedCount !== null && Number.isInteger(parsedCount) && parsedCount > 0) {
            migratedWorkoutCount = parsedCount;
            updates.rare_exercises_workout_count = parsedCount;
            migratedKeys.push(
                `training-log-rare-exercises-workout-count:${currentUserId}`
            );
        }
    } catch (error) {
        console.error("Błąd odczytu wcześniejszych ustawień z przeglądarki:", error);
        homeShortcutsStatus.textContent =
            "Nie udało się odczytać wcześniejszych ustawień zapisanych w tej przeglądarce.";
        return;
    }

    if (!migratedKeys.length) return;

    try {
        showPastTrainingPlans = migratedPastPlans;
        homeShortcutIds = migratedShortcuts;
        rareExercisesWorkoutLimit = migratedWorkoutCount;
        await saveUserSettings(updates);
    } catch (error) {
        showPastTrainingPlans = originalPastPlans;
        homeShortcutIds = originalShortcuts;
        rareExercisesWorkoutLimit = originalWorkoutCount;
        console.error("Błąd przenoszenia wcześniejszych ustawień do Supabase:", error);
        showPastTrainingPlansSetting.checked = showPastTrainingPlans;
        rareExercisesWorkoutCount.value = String(rareExercisesWorkoutLimit);
        applyHomeShortcuts(homeShortcutIds);
        draftHomeShortcutIds = [...homeShortcutIds];
        renderHomeShortcutSettings();
        homeShortcutsStatus.textContent =
            "Nie udało się przenieść wcześniejszych ustawień do bazy. Ustawienia w przeglądarce zostały zachowane.";
        pastTrainingPlansStatus.textContent =
            "Nie udało się zsynchronizować wcześniejszego ustawienia z bazą.";
        rareExercisesSettingsStatus.textContent =
            "Nie udało się zsynchronizować wcześniejszego ustawienia z bazą.";
        return;
    }

    migratedKeys.forEach(key => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error("Błąd usuwania przeniesionego ustawienia z przeglądarki:", error);
        }
    });
    showPastTrainingPlansSetting.checked = showPastTrainingPlans;
    rareExercisesWorkoutCount.value = String(rareExercisesWorkoutLimit);
    applyHomeShortcuts(homeShortcutIds);
    draftHomeShortcutIds = [...homeShortcutIds];
    renderHomeShortcutSettings();
}

homeShortcutsSetting.addEventListener("change", async event => {
    const input = event.target.closest('input[type="checkbox"]');
    if (!input || !homeShortcutsSetting.contains(input)) return;

    draftHomeShortcutIds = Array.from(
        homeShortcutsSetting.querySelectorAll('input[type="checkbox"]:checked'),
        checkedInput => checkedInput.value
    );

    if (draftHomeShortcutIds.length > 4) {
        input.checked = false;
        draftHomeShortcutIds = draftHomeShortcutIds.filter(id => id !== input.value);
        homeShortcutsStatus.textContent = "Możesz wybrać maksymalnie 4 skróty.";
        updateHomeShortcutOptionAvailability();
        return;
    }

    if (draftHomeShortcutIds.length < 4) {
        homeShortcutsStatus.textContent =
            `Zaznacz jeszcze ${4 - draftHomeShortcutIds.length}, aby zastosować wybór.`;
        updateHomeShortcutOptionAvailability();
        return;
    }

    if (!currentUserId) {
        draftHomeShortcutIds = [...homeShortcutIds];
        renderHomeShortcutSettings();
        homeShortcutsStatus.textContent =
            "Zaloguj się ponownie, aby zapisać ustawienie.";
        return;
    }

    homeShortcutsSetting
        .querySelectorAll('input[type="checkbox"]')
        .forEach(optionInput => {
            optionInput.disabled = true;
        });
    homeShortcutsStatus.textContent = "Zapisywanie skrótów...";
    try {
        await saveUserSettings({ home_shortcut_ids: draftHomeShortcutIds });
        applyHomeShortcuts(draftHomeShortcutIds);
        homeShortcutIds = [...draftHomeShortcutIds];
        cacheHomeShortcutPreferences(currentUserId, homeShortcutIds);
        homeShortcutsStatus.textContent = "Skróty zapisane.";
    } catch (error) {
        console.error("Błąd zapisu skrótów strony głównej:", error);
        draftHomeShortcutIds = [...homeShortcutIds];
        renderHomeShortcutSettings();
        homeShortcutsStatus.textContent =
            "Nie udało się zapisać skrótów. Przywrócono poprzedni wybór.";
    } finally {
        updateHomeShortcutOptionAvailability();
    }
});

settingsViewButton.addEventListener(
    "click",
    () => {
        historyView.classList.add("hidden");
        exercisesView.classList.add("hidden");
        exerciseConfigView.classList.add("hidden");
        gymsView.classList.add("hidden");
        weeklyView.classList.add("hidden");
        statisticsView.classList.add("hidden");
        rareExercisesView.classList.add("hidden");
        settingsStatus.textContent = "";
        pastTrainingPlansStatus.textContent = "";
        homeShortcutsStatus.textContent = "";
        settingsView.classList.remove("hidden");
    }
);

backToHistoryFromSettingsButton.addEventListener(
    "click",
    () => {
        settingsView.classList.add("hidden");
        historyView.classList.remove("hidden");
    }
);

groupIdenticalSetsSetting.addEventListener(
    "change",
    async () => {
        if (!currentUserId) {
            groupIdenticalSetsSetting.checked = false;
            settingsStatus.textContent = "Zaloguj się ponownie, aby zapisać ustawienie.";
            return;
        }

        const nextValue = groupIdenticalSetsSetting.checked;
        groupIdenticalSetsSetting.disabled = true;
        settingsStatus.textContent = "Zapisywanie ustawienia...";

        let saved = false;
        try {
            await saveUserSettings({ group_identical_sets: nextValue });
            saved = true;
        } catch (error) {
            console.error("Błąd zapisu ustawień użytkownika:", error);
            groupIdenticalSetsSetting.checked = groupIdenticalSets;
            settingsStatus.textContent = "Nie udało się zapisać ustawienia.";
            alert("Nie udało się zapisać ustawienia. Sprawdź, czy tabela user_settings zawiera wymagane kolumny.");
        } finally {
            groupIdenticalSetsSetting.disabled = false;
        }

        if (saved) {
            groupIdenticalSets = nextValue;
            settingsStatus.textContent = "Ustawienie zapisane.";
        }
    }
);

backToHistoryButton.addEventListener(
"click",
() => {


    activeWorkoutView.classList.add(
        "hidden"
    );

    historyView.classList.remove("hidden");

    activeWorkoutId = null;

    refreshApp();

}


);

/* EXERCISE NAVIGATION */

statisticsViewButton.addEventListener(
    "click",
    () => {
        historyView.classList.add("hidden");
        exercisesView.classList.add("hidden");
        exerciseConfigView.classList.add("hidden");
        gymsView.classList.add("hidden");
        weeklyView.classList.add("hidden");
        statisticsView.classList.remove("hidden");

        renderStatistics();
    }
);

backToHistoryFromStatisticsButton.addEventListener(
    "click",
    () => {
        statisticsView.classList.add("hidden");
        historyView.classList.remove("hidden");
    }
);

function renderTrainingPlanWorkoutList() {
    const orderedWorkouts = [...workouts].sort((a, b) =>
        b.date.localeCompare(a.date) ||
        a.name.localeCompare(b.name, "pl")
    );

    trainingPlanWorkoutList.innerHTML = orderedWorkouts.length
        ? orderedWorkouts.map(workout => {
            const plannedExerciseCount = workout.exercises.filter(exercise =>
                hasPlannedSets(exercise)
            ).length;
            const dateLabel = getRelativeDateLabel(workout.date);

            return `
                <button
                    type="button"
                    class="training-plan-workout-tile"
                    data-select-plan-workout="${escapeHtml(String(workout.id))}"
                >
                    <span class="training-plan-workout-tile-date">
                        ${formatDate(workout.date)}
                        ${dateLabel ? `<span class="relative-date-badge">${escapeHtml(dateLabel)}</span>` : ""}
                    </span>
                    <strong>${escapeHtml(workout.name)}</strong>
                    <span class="training-plan-workout-tile-meta">
                        ${workout.exercises.length} ćw.
                        ${plannedExerciseCount
                            ? `· ${plannedExerciseCount} w planie`
                            : ""}
                    </span>
                </button>
            `;
        }).join("")
        : `<p class="training-plan-empty">Brak treningów. Dodaj trening, aby zaplanować ćwiczenia.</p>`;
}

function renderTrainingPlanWorkout() {
    const workout = workouts.find(item =>
        String(item.id) === String(activeTrainingPlanWorkoutId)
    );
    if (!workout) {
        activeTrainingPlanWorkoutId = null;
        trainingPlanWorkoutListView.classList.remove("hidden");
        trainingPlanWorkoutDetailView.classList.add("hidden");
        renderTrainingPlanWorkoutList();
        return;
    }

    trainingPlanWorkoutListView.classList.add("hidden");
    trainingPlanWorkoutDetailView.classList.remove("hidden");
    trainingPlanWorkoutTitle.textContent = workout.name;
    trainingPlanWorkoutDate.textContent = formatDate(workout.date);
    openSelectedWorkoutButton.dataset.workoutId = String(workout.id);
    trainingPlanSelectedExercises.dataset.workoutId = String(workout.id);

    const selectedExercises = workout.exercises.filter(exercise =>
        Array.isArray(exercise.plannedSets) && exercise.plannedSets.length > 0
    );
    const selectedIds = new Set(
        selectedExercises.map(exercise => String(exercise.id))
    );
    const plannedNames = new Set(
        selectedExercises.map(exercise => exercise.name.trim().toLowerCase())
    );
    const availableExercises = workout.exercises.filter(exercise =>
        !selectedIds.has(String(exercise.id))
    );
    const catalogExercises = getExercisesAlphabetically().filter(exercise =>
        !plannedNames.has(exercise.name.trim().toLowerCase()) &&
        !workout.exercises.some(workoutExercise =>
            workoutExercise.name.trim().toLowerCase() ===
            exercise.name.trim().toLowerCase()
        )
    );
    const popularCatalogExercises =
        getPopularExercises(catalogExercises);

    trainingPlanExercisePicker.innerHTML = `
        <h3>Dodaj ćwiczenie do planu</h3>
        <div class="training-plan-exercise-picker-list">
            ${availableExercises.map(exercise => `
                <button
                    type="button"
                    class="button button-secondary"
                    data-add-plan-exercise="${escapeHtml(String(exercise.id))}"
                >+ ${escapeHtml(exercise.name)}</button>
            `).join("")}
            <button
                type="button"
                class="button button-secondary training-plan-add-other"
                data-toggle-plan-catalog
                aria-expanded="false"
                ${catalogExercises.length ? "" : "disabled"}
            >+ Inne</button>
        </div>
        <form class="training-plan-catalog-exercise-form hidden" data-plan-catalog-form>
            <label class="form-field">
                Wybierz ćwiczenie z katalogu
                <select data-plan-catalog-select required>
                    <option value="">Wybierz ćwiczenie</option>
                    ${popularCatalogExercises.length
                        ? `<optgroup label="Najczęściej wybierane">
                            ${popularCatalogExercises.map(exercise =>
                                `<option value="${escapeHtml(exercise.name)}">${escapeHtml(exercise.name)}</option>`
                            ).join("")}
                        </optgroup>`
                        : ""}
                    ${catalogExercises.length
                        ? `<optgroup label="Wszystkie ćwiczenia">
                            ${catalogExercises.map(exercise =>
                                `<option value="${escapeHtml(exercise.name)}">${escapeHtml(exercise.name)}</option>`
                            ).join("")}
                        </optgroup>`
                        : ""}
                </select>
            </label>
            <button type="submit" class="button button-secondary">Dodaj do planu</button>
        </form>
        ${availableExercises.length || catalogExercises.length
            ? ""
            : `<p class="training-plan-empty">Wszystkie ćwiczenia z katalogu są już w planie.</p>`}
    `;

    trainingPlanSelectedExercises.innerHTML = selectedExercises.length
        ? selectedExercises.map(exercise =>
            renderTrainingPlanExercise(exercise)
        ).join("")
        : `<p class="training-plan-empty">Wybierz ćwiczenia powyżej, aby dodać do nich planowane serie.</p>`;

    const selectedExerciseNames = new Set(
        selectedExercises.map(exercise => exercise.name.trim().toLowerCase())
    );
    const previousWorkouts = workouts
        .filter(previousWorkout =>
            previousWorkout.date < workout.date &&
            previousWorkout.exercises.some(exercise =>
                selectedExerciseNames.has(exercise.name.trim().toLowerCase())
            )
        )
        .sort((a, b) =>
            b.date.localeCompare(a.date) ||
            b.name.localeCompare(a.name, "pl")
        );

    trainingPlanHistory.innerHTML = selectedExerciseNames.size
        ? previousWorkouts.length
            ? previousWorkouts.map(previousWorkout =>
                renderWorkoutExerciseHistory(
                    previousWorkout,
                    previousWorkout.exercises.filter(exercise =>
                        selectedExerciseNames.has(exercise.name.trim().toLowerCase())
                    )
                )
            ).join("")
            : `<p class="training-plan-empty">Brak wcześniejszych treningów z wybranymi ćwiczeniami.</p>`
        : `<p class="training-plan-empty">Wybierz ćwiczenia, aby zobaczyć ich wcześniejsze treningi.</p>`;
}

function renderTrainingPlanExercise(exercise) {
    const fields = getTrainingPlanFields(exercise.name);
    const savedSets = Array.isArray(exercise.plannedSets)
        ? exercise.plannedSets
        : [];
    const sets = savedSets;
    const mobileColumns = getSetMobileColumns(fields);
    const hasFutureTargets =
        hasPlannedSets(exercise) &&
        getFutureTrainingPlanTargets(activeTrainingPlanWorkoutId).length > 0;

    return `
        <section class="training-plan-exercise">
            <header class="training-plan-exercise-heading">
                <div>
                    <span class="training-plan-mode-label">PLANOWANE SERIE</span>
                    <h3>${escapeHtml(exercise.name)}</h3>
                </div>
                <div class="training-plan-exercise-actions">
                    ${hasFutureTargets ? `
                        <details class="training-plan-exercise-menu">
                            <summary aria-label="Więcej opcji dla ${escapeHtml(exercise.name)}">⋯</summary>
                            <button
                                type="button"
                                data-move-plan-exercise="${escapeHtml(String(exercise.id))}"
                            >Przenieś do treningu</button>
                        </details>
                    ` : ""}
                    <button
                        type="button"
                        class="button button-secondary training-plan-remove-exercise"
                        data-remove-plan-exercise="${escapeHtml(String(exercise.id))}"
                    >Usuń z planu</button>
                    <button
                        type="button"
                        class="button button-secondary training-plan-delete-exercise"
                        data-delete-workout-exercise="${escapeHtml(String(exercise.id))}"
                    >Usuń z treningu</button>
                </div>
            </header>
            <div
                class="set-fields-scroll training-plan-set-fields-scroll"
                style="--set-mobile-columns: ${mobileColumns}; --plan-field-count: ${fields.length}"
            >
                <div class="set-row set-header">
                    <div>PLAN</div>
                    ${renderSetFieldHeaders(fields)}
                    <div><span class="visually-hidden">Akcje</span></div>
                </div>
                ${sets.map((set, setIndex) => `
                    <div class="set-row">
                        <div class="set-number">${setIndex + 1}</div>
                        ${fields.map(field => renderSetFieldControl(
                            field,
                            set,
                            `data-plan-exercise-id="${escapeHtml(String(exercise.id))}" data-plan-set-index="${setIndex}" data-plan-field="${field}" aria-label="${escapeHtml(FIELD_DEFINITIONS[field].label)} seria ${setIndex + 1} dla ${escapeHtml(exercise.name)}"`
                        )).join("")}
                        <button
                            type="button"
                            class="remove-set"
                            data-remove-planned-set="${setIndex}"
                            data-plan-exercise-id="${escapeHtml(String(exercise.id))}"
                            aria-label="Usuń planowaną serię ${setIndex + 1}"
                        >×</button>
                    </div>
                `).join("")}
            </div>
            <button
                type="button"
                class="add-set-button training-plan-add-set"
                data-add-planned-set
                data-plan-exercise-id="${escapeHtml(String(exercise.id))}"
            >+ Dodaj serię</button>
        </section>
    `;
}

function getFutureTrainingPlanTargets(sourceWorkoutId) {
    return workouts
        .filter(workout =>
            workout.date > getTodayInternal() &&
            String(workout.id) !== String(sourceWorkoutId)
        )
        .sort((a, b) =>
            a.date.localeCompare(b.date) ||
            a.name.localeCompare(b.name, "pl")
        );
}

function openMovePlannedExerciseDialog(exerciseId) {
    const sourceWorkout = workouts.find(workout =>
        workout.exercises.some(exercise =>
            String(exercise.id) === String(exerciseId)
        )
    );
    const exercise = sourceWorkout?.exercises.find(item =>
        String(item.id) === String(exerciseId)
    );
    if (!sourceWorkout || !exercise) return;

    const targets = getFutureTrainingPlanTargets(sourceWorkout.id);
    if (!targets.length) return;

    movingPlannedExerciseId = exercise.id;
    movingPlannedExerciseWorkoutId = sourceWorkout.id;
    movePlannedExerciseName.textContent = exercise.name;
    movePlannedExerciseStatus.textContent = "";
    movePlannedExerciseTarget.innerHTML = `
        <option value="">Wybierz trening</option>
        ${targets.map(workout => `
            <option value="${escapeHtml(String(workout.id))}">
                ${escapeHtml(formatDate(workout.date))} · ${escapeHtml(workout.name)}
            </option>
        `).join("")}
    `;
    confirmMovePlannedExerciseButton.disabled = false;
    movePlannedExerciseDialog.showModal();
}

async function waitForPlannedSetsSave(exercise) {
    const pendingSaveTimer = plannedSetsSaveTimers.get(exercise.id);
    if (pendingSaveTimer) {
        clearTimeout(pendingSaveTimer);
        plannedSetsSaveTimers.delete(exercise.id);
    }

    const pendingSave = plannedSetsSaveQueues.get(exercise.id);
    if (pendingSave) await pendingSave;
}

function getPersistablePlannedSets(exercise) {
    const fields = getTrainingPlanFields(exercise.name);
    return (exercise.plannedSets || []).filter(set =>
        fields.some(field =>
            set[field] !== null &&
            set[field] !== undefined &&
            String(set[field]).trim() !== ""
        )
    );
}

function createPlannedSetRows(exerciseId, plannedSets, startOrder) {
    return plannedSets.map((set, index) => {
        const data = { ...set };
        delete data.id;
        for (const field of NUMERIC_SET_FIELDS) {
            if (data[field] !== "" && data[field] !== null && data[field] !== undefined) {
                const numericValue = parseNumericInput(data[field]);
                if (!Number.isFinite(numericValue)) {
                    throw new Error(`Nieprawidłowa wartość liczbowa w polu ${field}.`);
                }
                data[field] = numericValue;
            }
        }

        return {
            workout_exercise_id: exerciseId,
            set_order: startOrder + index,
            data
        };
    });
}

async function movePlannedExercise(sourceWorkout, sourceExercise, targetWorkout) {
    if (!sourceWorkout.exercises.includes(sourceExercise)) {
        throw new Error("Ćwiczenie nie należy do treningu źródłowego.");
    }

    let targetExercise = targetWorkout.exercises.find(exercise =>
        exercise.name.trim().toLowerCase() ===
        sourceExercise.name.trim().toLowerCase()
    );
    let createdTargetExercise = false;
    let destinationRowsWritten = false;
    let targetPlannedSets = [];

    try {
        await waitForPlannedSetsSave(sourceExercise);
        const sourcePlannedSets = getPersistablePlannedSets(sourceExercise)
            .map(({ id, ...set }) => ({ ...set }));
        if (!sourcePlannedSets.length) {
            throw new Error("To ćwiczenie nie ma zapisanych planowanych serii.");
        }

        if (targetExercise) {
            await waitForPlannedSetsSave(targetExercise);
            targetPlannedSets = getPersistablePlannedSets(targetExercise)
                .map(({ id, ...set }) => ({ ...set }));
        }

        if (!targetExercise) {
            const { data: savedExercise, error } = await supabaseClient
                .from("workout_exercises")
                .insert({
                    workout_id: targetWorkout.id,
                    exercise_id: sourceExercise.exerciseId || null,
                    name: sourceExercise.name,
                    notes: "",
                    exercise_order: targetWorkout.exercises.length
                })
                .select()
                .single();
            if (error) throw error;

            targetExercise = {
                id: savedExercise.id,
                exerciseId: savedExercise.exercise_id,
                name: savedExercise.name,
                notes: savedExercise.notes || "",
                plannedSets: [],
                sets: []
            };
            createdTargetExercise = true;
        }

        const rows = createPlannedSetRows(
            targetExercise.id,
            [...targetPlannedSets, ...sourcePlannedSets],
            0
        );
        destinationRowsWritten = true;
        const { error: insertError } = await supabaseClient
            .from("planned_sets")
            .upsert(rows, {
                onConflict: "workout_exercise_id,set_order"
            });
        if (insertError) throw insertError;

        const { error: deleteError } = await supabaseClient
            .from("planned_sets")
            .delete()
            .eq("workout_exercise_id", sourceExercise.id);
        if (deleteError) throw deleteError;

        targetExercise.plannedSets = [
            ...targetPlannedSets,
            ...sourcePlannedSets
        ];
        sourceExercise.plannedSets = [];
        if (createdTargetExercise) targetWorkout.exercises.push(targetExercise);

        trainingPlanStatus.textContent =
            `Przeniesiono plan ćwiczenia „${sourceExercise.name}” do treningu „${targetWorkout.name}”.`;
        renderTrainingPlanWorkout();
        renderTrainingPlanWorkoutList();
    } catch (error) {
        if (destinationRowsWritten && targetExercise) {
            const restoreRows = createPlannedSetRows(
                targetExercise.id,
                targetPlannedSets,
                0
            );
            if (restoreRows.length) {
                const { error: restoreError } = await supabaseClient
                    .from("planned_sets")
                    .upsert(restoreRows, {
                        onConflict: "workout_exercise_id,set_order"
                    });
                if (restoreError) {
                    console.error("Błąd przywracania poprzedniego planu docelowego:", restoreError);
                }
            }
            const { error: cleanupError } = await supabaseClient
                .from("planned_sets")
                .delete()
                .eq("workout_exercise_id", targetExercise.id)
                .gte("set_order", targetPlannedSets.length);
            if (cleanupError) {
                console.error("Błąd wycofywania planu docelowego po nieudanym przenoszeniu:", cleanupError);
            }
        }
        if (createdTargetExercise && targetExercise) {
            const { error: cleanupError } = await supabaseClient
                .from("workout_exercises")
                .delete()
                .eq("id", targetExercise.id);
            if (cleanupError) {
                console.error("Błąd usuwania ćwiczenia docelowego po nieudanym przenoszeniu:", cleanupError);
            }
        }
        throw error;
    }
}

function findWorkoutExerciseById(exerciseId) {
    return workouts
        .flatMap(workout => workout.exercises)
        .find(exercise => String(exercise.id) === String(exerciseId));
}

function savePlannedSets(exercise) {
    if (!exercise?.id) {
        trainingPlanStatus.textContent =
            "Nie można zapisać planu: wpis ćwiczenia nie ma identyfikatora.";
        return;
    }

    clearTimeout(plannedSetsSaveTimers.get(exercise.id));
    plannedSetsSaveTimers.set(exercise.id, setTimeout(async () => {
        plannedSetsSaveTimers.delete(exercise.id);
        const previousSave = plannedSetsSaveQueues.get(exercise.id) || Promise.resolve();
        const savePromise = previousSave.catch(() => {}).then(async () => {
            const plannedSets = (exercise.plannedSets || []).filter(set =>
                getTrainingPlanFields(exercise.name).some(field =>
                    set[field] !== null &&
                    set[field] !== undefined &&
                    String(set[field]).trim() !== ""
                )
            );
            const rows = [];
            for (const set of plannedSets) {
                const data = { ...set };
                delete data.id;
                for (const field of NUMERIC_SET_FIELDS) {
                    if (data[field] !== "" && data[field] !== null && data[field] !== undefined) {
                        const numericValue = parseNumericInput(data[field]);
                        if (!Number.isFinite(numericValue)) {
                            throw new Error(`Nieprawidłowa wartość liczbowa w polu ${field}.`);
                        }
                        data[field] = numericValue;
                    }
                }

                rows.push({
                    workout_exercise_id: exercise.id,
                    set_order: rows.length,
                    data
                });
            }

            if (rows.length) {
                const { error } = await supabaseClient
                    .from("planned_sets")
                    .upsert(rows, {
                        onConflict: "workout_exercise_id,set_order"
                    });
                if (error) throw error;
            }

            const { error: deleteError } = await supabaseClient
                .from("planned_sets")
                .delete()
                .eq("workout_exercise_id", exercise.id)
                .gte("set_order", rows.length);
            if (deleteError) throw deleteError;
        });
        plannedSetsSaveQueues.set(exercise.id, savePromise);
        savePromise.then(() => {
            if (plannedSetsSaveQueues.get(exercise.id) === savePromise) {
                plannedSetsSaveQueues.delete(exercise.id);
                trainingPlanStatus.textContent = "Planowane serie zapisane w Supabase.";
            }
        }, error => {
            if (plannedSetsSaveQueues.get(exercise.id) === savePromise) {
                plannedSetsSaveQueues.delete(exercise.id);
            }
            console.error("Błąd zapisu planowanych serii:", error);
            trainingPlanStatus.textContent =
                error?.code === "42P01" ||
                (error?.code === "PGRST205" && error.message?.includes("planned_sets"))
                    ? "Brak tabeli planned_sets w bazie. Zastosuj migrację Supabase."
                    : "Nie udało się zapisać planowanych serii. Spróbuj ponownie.";
        });
    }, 400));
}

function openTrainingPlan(workoutId = null, exerciseId = null) {
    historyView.classList.add("hidden");
    activeWorkoutView.classList.add("hidden");
    exercisesView.classList.add("hidden");
    exerciseConfigView.classList.add("hidden");
    gymsView.classList.add("hidden");
    weeklyView.classList.add("hidden");
    statisticsView.classList.add("hidden");
    rareExercisesView.classList.add("hidden");
    settingsView.classList.add("hidden");
    recordsView.classList.add("hidden");
    competitionView.classList.add("hidden");
    trainingPlanView.classList.remove("hidden");
    document.querySelector("#headerMenu").open = false;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    trainingPlanStatus.textContent = "";
    activeTrainingPlanWorkoutId = null;
    trainingPlanWorkoutDetailView.classList.add("hidden");
    trainingPlanWorkoutListView.classList.remove("hidden");
    renderTrainingPlanWorkoutList();
    if (workoutId !== null) {
        const workout = workouts.find(item =>
            String(item.id) === String(workoutId)
        );
        const exercise = workout?.exercises.find(item =>
            String(item.id) === String(exerciseId)
        );
        if (exercise && !hasPlannedSets(exercise)) {
            exercise.plannedSets = [
                createEmptyPlannedSet(getTrainingPlanFields(exercise.name))
            ];
            savePlannedSets(exercise);
        }
        openTrainingPlanWorkout(workoutId);
    }
}

trainingPlanViewButton.addEventListener("click", () => {
    openTrainingPlan();
});

addTrainingPlanWorkoutButton.addEventListener("click", () => {
    openNewWorkoutDialog(true);
});

backToHistoryFromTrainingPlanButton.addEventListener("click", () => {
    trainingPlanView.classList.add("hidden");
    historyView.classList.remove("hidden");
});

function openTrainingPlanWorkout(workoutId) {
    const workout = workouts.find(item =>
        String(item.id) === String(workoutId)
    );
    if (!workout) return;

    activeTrainingPlanWorkoutId = workout.id;
    renderTrainingPlanWorkout();
}

trainingPlanWorkoutList.addEventListener("click", event => {
    const tile = event.target.closest("[data-select-plan-workout]");
    if (!tile || !trainingPlanWorkoutList.contains(tile)) return;
    openTrainingPlanWorkout(tile.dataset.selectPlanWorkout);
});

backToTrainingPlanWorkoutsButton.addEventListener("click", () => {
    activeTrainingPlanWorkoutId = null;
    trainingPlanWorkoutDetailView.classList.add("hidden");
    trainingPlanWorkoutListView.classList.remove("hidden");
    renderTrainingPlanWorkoutList();
});

openSelectedWorkoutButton.addEventListener("click", () => {
    if (activeTrainingPlanWorkoutId === null) return;
    trainingPlanView.classList.add("hidden");
    openWorkout(Number(activeTrainingPlanWorkoutId));
});

trainingPlanExercisePicker.addEventListener("click", event => {
    const catalogToggle = event.target.closest("[data-toggle-plan-catalog]");
    if (catalogToggle) {
        const form = trainingPlanExercisePicker.querySelector("[data-plan-catalog-form]");
        const expanded = catalogToggle.getAttribute("aria-expanded") === "true";
        catalogToggle.setAttribute("aria-expanded", String(!expanded));
        form.classList.toggle("hidden", expanded);
        if (!expanded) {
            form.querySelector("[data-plan-catalog-select]").focus();
        }
        return;
    }

    const button = event.target.closest("[data-add-plan-exercise]");
    if (!button || !trainingPlanExercisePicker.contains(button)) return;
    const exercise = findWorkoutExerciseById(button.dataset.addPlanExercise);
    if (!exercise) return;

    exercise.plannedSets = [createEmptyPlannedSet(
        getTrainingPlanFields(exercise.name)
    )];
    savePlannedSets(exercise);
    renderTrainingPlanWorkout();
});

trainingPlanExercisePicker.addEventListener("submit", async event => {
    const form = event.target.closest("[data-plan-catalog-form]");
    if (!form) return;
    event.preventDefault();
    const workout = workouts.find(item =>
        String(item.id) === String(activeTrainingPlanWorkoutId)
    );
    const catalogSelect = form.querySelector("[data-plan-catalog-select]");
    const catalogExercise = exercises.find(exercise =>
        exercise.name === catalogSelect.value
    );
    if (!workout || !catalogExercise) return;

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
        let exercise = workout.exercises.find(item =>
            item.name.trim().toLowerCase() ===
            catalogExercise.name.trim().toLowerCase()
        );

        if (!exercise) {
            const { data: savedExercise, error } = await supabaseClient
                .from("workout_exercises")
                .insert({
                    workout_id: workout.id,
                    exercise_id: catalogExercise.id,
                    name: catalogExercise.name,
                    notes: "",
                    exercise_order: workout.exercises.length
                })
                .select()
                .single();

            if (error) throw error;

            exercise = {
                id: savedExercise.id,
                exerciseId: catalogExercise.id,
                name: savedExercise.name,
                notes: "",
                plannedSets: [],
                sets: []
            };
            workout.exercises.push(exercise);
        }

        exercise.plannedSets = [
            createEmptyPlannedSet(getTrainingPlanFields(exercise.name))
        ];
        trainingPlanStatus.textContent = "";
        catalogSelect.value = "";
        savePlannedSets(exercise);
        renderTrainingPlanWorkout();
    } catch (error) {
        console.error("Błąd dodawania ćwiczenia z katalogu do planu:", error);
        trainingPlanStatus.textContent =
            "Nie udało się dodać ćwiczenia. Spróbuj ponownie.";
    } finally {
        submitButton.disabled = false;
    }
});

trainingPlanSelectedExercises.addEventListener("input", event => {
    const input = event.target.closest("[data-plan-exercise-id][data-plan-field]");
    if (input && input.tagName !== "SELECT") updatePlannedSet(input);
});

trainingPlanSelectedExercises.addEventListener("change", event => {
    const select = event.target.closest(
        'select[data-plan-exercise-id][data-plan-field]'
    );
    updatePlannedSet(select);
});

trainingPlanSelectedExercises.addEventListener("click", async event => {
    const deleteWorkoutExerciseButton = event.target.closest(
        "[data-delete-workout-exercise]"
    );
    if (deleteWorkoutExerciseButton) {
        const exercise = findWorkoutExerciseById(
            deleteWorkoutExerciseButton.dataset.deleteWorkoutExercise
        );
        const workout = workouts.find(item =>
            String(item.id) === String(activeTrainingPlanWorkoutId)
        );
        if (!exercise || !workout || !workout.exercises.includes(exercise)) return;

        const confirmed = confirm(
            `Czy na pewno usunąć ćwiczenie "${exercise.name}" z treningu? ` +
            "Usunięte zostaną również jego wykonane i zaplanowane serie."
        );
        if (!confirmed) return;

        deleteWorkoutExerciseButton.disabled = true;
        const pendingSaveTimer = plannedSetsSaveTimers.get(exercise.id);
        if (pendingSaveTimer) {
            clearTimeout(pendingSaveTimer);
            plannedSetsSaveTimers.delete(exercise.id);
        }

        const pendingSave = plannedSetsSaveQueues.get(exercise.id);
        if (pendingSave) {
            try {
                await pendingSave;
            } catch (error) {
                console.error("Błąd zapisu planu przed usunięciem ćwiczenia:", error);
            }
        }

        try {
            const { error } = await supabaseClient
                .from("workout_exercises")
                .delete()
                .eq("id", exercise.id);
            if (error) throw error;

            workout.exercises = workout.exercises.filter(item => item !== exercise);
            plannedSetsSaveTimers.delete(exercise.id);
            plannedSetsSaveQueues.delete(exercise.id);
            trainingPlanStatus.textContent = "";
            renderTrainingPlanWorkout();
        } catch (error) {
            console.error("Błąd usuwania ćwiczenia z treningu:", error);
            trainingPlanStatus.textContent =
                "Nie udało się usunąć ćwiczenia z treningu. Spróbuj ponownie.";
            deleteWorkoutExerciseButton.disabled = false;
        }
        return;
    }

    const removeExerciseButton = event.target.closest("[data-remove-plan-exercise]");
    if (removeExerciseButton) {
        const exercise = findWorkoutExerciseById(
            removeExerciseButton.dataset.removePlanExercise
        );
        if (!exercise) return;
        exercise.plannedSets = [];
        savePlannedSets(exercise);
        renderTrainingPlanWorkout();
        return;
    }

    const addButton = event.target.closest("[data-add-planned-set]");
    if (addButton) {
        const exercise = findWorkoutExerciseById(addButton.dataset.planExerciseId);
        if (!exercise) return;

        const fields = getTrainingPlanFields(exercise.name);
        exercise.plannedSets = Array.isArray(exercise.plannedSets)
            ? exercise.plannedSets
            : [];
        const previousSet = exercise.plannedSets[exercise.plannedSets.length - 1];
        if (previousSet) {
            const { id, ...setData } = previousSet;
            exercise.plannedSets.push(setData);
        } else {
            exercise.plannedSets.push(createEmptyPlannedSet(fields));
        }
        savePlannedSets(exercise);
        renderTrainingPlanWorkout();
        return;
    }

    const removeButton = event.target.closest("[data-remove-planned-set]");
    if (!removeButton) return;

    const exercise = findWorkoutExerciseById(removeButton.dataset.planExerciseId);
    if (!exercise || !Array.isArray(exercise.plannedSets)) return;
    exercise.plannedSets.splice(Number(removeButton.dataset.removePlannedSet), 1);
    savePlannedSets(exercise);
    renderTrainingPlanWorkout();
});

trainingPlanSelectedExercises.addEventListener("click", event => {
    const moveButton = event.target.closest("[data-move-plan-exercise]");
    if (!moveButton || !trainingPlanSelectedExercises.contains(moveButton)) return;

    const menu = moveButton.closest("details");
    if (menu) menu.open = false;
    openMovePlannedExerciseDialog(moveButton.dataset.movePlanExercise);
});

movePlannedExerciseDialog.addEventListener("cancel", event => {
    if (confirmMovePlannedExerciseButton.disabled) event.preventDefault();
});

movePlannedExerciseDialog.addEventListener("close", () => {
    movingPlannedExerciseId = null;
    movingPlannedExerciseWorkoutId = null;
});

cancelMovePlannedExerciseButton.addEventListener("click", () => {
    movePlannedExerciseDialog.close();
    movingPlannedExerciseId = null;
    movingPlannedExerciseWorkoutId = null;
});

movePlannedExerciseForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (
        movingPlannedExerciseId === null ||
        movingPlannedExerciseWorkoutId === null ||
        !movePlannedExerciseTarget.value
    ) return;

    const sourceWorkout = workouts.find(workout =>
        String(workout.id) === String(movingPlannedExerciseWorkoutId)
    );
    const sourceExercise = sourceWorkout?.exercises.find(exercise =>
        String(exercise.id) === String(movingPlannedExerciseId)
    );
    const targetWorkout = getFutureTrainingPlanTargets(sourceWorkout?.id)
        .find(workout =>
            String(workout.id) === movePlannedExerciseTarget.value
        );
    if (!sourceWorkout || !sourceExercise || !targetWorkout) {
        movePlannedExerciseStatus.textContent =
            "Nie można przenieść ćwiczenia: wybierz istniejący przyszły trening.";
        return;
    }

    confirmMovePlannedExerciseButton.disabled = true;
    trainingPlanStatus.textContent = "";
    movePlannedExerciseStatus.textContent = "";
    try {
        await movePlannedExercise(sourceWorkout, sourceExercise, targetWorkout);
        movePlannedExerciseDialog.close();
        movingPlannedExerciseId = null;
        movingPlannedExerciseWorkoutId = null;
    } catch (error) {
        console.error("Błąd przenoszenia planu ćwiczenia:", error);
        movePlannedExerciseStatus.textContent =
            "Nie udało się dokończyć przenoszenia. Plan źródłowy pozostał; sprawdź trening docelowy.";
        savePlannedSets(sourceExercise);
    } finally {
        confirmMovePlannedExerciseButton.disabled = false;
    }
});

trainingPlanHistory.addEventListener("click", event => {
    const exerciseTrigger = event.target.closest("[data-exercise-history-name]");
    if (exerciseTrigger && trainingPlanHistory.contains(exerciseTrigger)) {
        event.stopPropagation();
        trainingPlanView.classList.add("hidden");
        openExerciseHistory(exerciseTrigger.dataset.exerciseHistoryName);
        return;
    }

    const workoutCard = event.target.closest(".workout-card[data-id]");
    if (!workoutCard || !trainingPlanHistory.contains(workoutCard)) return;
    trainingPlanView.classList.add("hidden");
    openWorkout(Number(workoutCard.dataset.id));
});

function updatePlannedSet(input) {
    if (!input) return;
    if (!input.checkValidity()) {
        trainingPlanStatus.textContent =
            "Wartość poza dozwolonym zakresem — popraw ją, aby zapisać plan.";
        return;
    }

    const exercise = findWorkoutExerciseById(input.dataset.planExerciseId);
    const field = input.dataset.planField;
    if (!exercise || !getTrainingPlanFields(exercise.name).includes(field)) {
        return;
    }

    if (
        NUMERIC_SET_FIELDS.includes(field) &&
        input.value.trim() !== "" &&
        !Number.isFinite(parseNumericInput(input.value))
    ) {
        trainingPlanStatus.textContent =
            "Wpisz poprawną liczbę. Możesz użyć przecinka lub kropki.";
        return;
    }

    if (
        field === "rpe" &&
        input.value.trim() !== "" &&
        !Number.isInteger(parseNumericInput(input.value) * 4)
    ) {
        trainingPlanStatus.textContent =
            "RPE musi być wielokrotnością 0,25.";
        return;
    }

    const fields = getTrainingPlanFields(exercise.name);
    const setIndex = Number(input.dataset.planSetIndex);
    if (!Number.isInteger(setIndex) || setIndex < 0) return;
    exercise.plannedSets = Array.isArray(exercise.plannedSets)
        ? exercise.plannedSets
        : [];
    while (exercise.plannedSets.length <= setIndex) {
        exercise.plannedSets.push(createEmptyPlannedSet(fields));
    }
    exercise.plannedSets[setIndex][field] =
        NUMERIC_SET_FIELDS.includes(field) && input.value.trim() !== ""
            ? parseNumericInput(input.value)
            : input.value;
    savePlannedSets(exercise);
}

statisticsExerciseSelect.addEventListener(
    "change",
    () => renderExerciseWeightChart(statisticsExerciseSelect.value)
);

window.addEventListener("resize", () => {
    if (!statisticsView.classList.contains("hidden") && statisticsExerciseSelect.value) {
        renderExerciseWeightChart(statisticsExerciseSelect.value);
    }
});

weeklyViewButton.addEventListener(
    "click",
    () => {
        historyView.classList.add("hidden");
        exercisesView.classList.add("hidden");
        exerciseConfigView.classList.add("hidden");
        gymsView.classList.add("hidden");
        weeklyView.classList.remove("hidden");

        renderWeeklyWorkoutList();
    }
);

backToHistoryFromWeeklyButton.addEventListener(
    "click",
    () => {
        weeklyView.classList.add("hidden");
        historyView.classList.remove("hidden");
    }
);

rareExercisesViewButton.addEventListener(
    "click",
    () => {
        historyView.classList.add("hidden");
        exercisesView.classList.add("hidden");
        exerciseConfigView.classList.add("hidden");
        gymsView.classList.add("hidden");
        weeklyView.classList.add("hidden");
        statisticsView.classList.add("hidden");
        rareExercisesView.classList.remove("hidden");

        renderRareExercises();
    }
);

backToHistoryFromRareExercisesButton.addEventListener(
    "click",
    () => {
        rareExercisesView.classList.add("hidden");
        historyView.classList.remove("hidden");
    }
);

rareExercisesWorkoutCount.addEventListener(
    "change",
    async () => {
        const count = Number(rareExercisesWorkoutCount.value);
        if (!Number.isInteger(count) || count <= 0) {
            rareExercisesWorkoutCount.value = String(rareExercisesWorkoutLimit);
            rareExercisesSettingsStatus.textContent =
                "Wpisz dodatnią liczbę całkowitą.";
            return;
        }

        if (!currentUserId) {
            rareExercisesWorkoutCount.value = String(rareExercisesWorkoutLimit);
            rareExercisesSettingsStatus.textContent =
                "Zaloguj się ponownie, aby zapisać ustawienie.";
            return;
        }

        const previousCount = rareExercisesWorkoutLimit;
        rareExercisesWorkoutCount.disabled = true;
        rareExercisesSettingsStatus.textContent = "Zapisywanie ustawienia...";
        rareExercisesWorkoutLimit = count;
        try {
            await saveUserSettings({
                rare_exercises_workout_count: count
            });
            rareExercisesSettingsStatus.textContent = "Ustawienie zapisane.";
        } catch (error) {
            console.error(
                "Błąd zapisu liczby treningów dla rzadkich ćwiczeń:",
                error
            );
            rareExercisesWorkoutLimit = previousCount;
            rareExercisesWorkoutCount.value = String(previousCount);
            rareExercisesSettingsStatus.textContent =
                "Nie udało się zapisać ustawienia.";
        } finally {
            rareExercisesWorkoutCount.disabled = false;
        }

        renderRareExercises();
    }
);

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

workoutDialog.addEventListener("close", () => {
    isCreatingWorkoutFromPlan = false;
});

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

let dataLoadPromise = null;

async function loadDataFromSupabase() {

    if (dataLoadPromise) {
        return dataLoadPromise;
    }

    const cachedShortcutIds =
        getCachedHomeShortcutPreferences(currentUserId);
    if (cachedShortcutIds) {
        loadHomeShortcutPreferences(cachedShortcutIds);
    }

    isWorkoutsLoading = true;
    setApplicationLoading(!cachedShortcutIds && isMainScreenVisible());
    renderWorkouts();

    dataLoadPromise = fetchDataFromSupabase()
        .finally(() => {
            isWorkoutsLoading = false;
            dataLoadPromise = null;
            refreshApp();
            setApplicationLoading(false);
        });

    return dataLoadPromise;
}

async function fetchDataFromSupabase() {

    const {
        data: {
            user
        }
    } =
        await supabaseClient.auth.getUser();


    if (!user) return;

    currentUserId = user.id;

    const {
        data: userSettings,
        error: userSettingsError
    } = await supabaseClient
        .from("user_settings")
        .select([
            "group_identical_sets",
            "show_past_training_plans",
            "home_shortcut_ids",
            "rare_exercises_workout_count"
        ].join(","))
        .eq("user_id", user.id)
        .maybeSingle();

    if (userSettingsError) {
        console.error("Błąd pobierania ustawień użytkownika:", userSettingsError);
        settingsStatus.textContent =
            "Nie udało się pobrać ustawień. Sprawdź, czy tabela user_settings zawiera wymagane kolumny.";
        groupIdenticalSets = false;
        groupIdenticalSetsSetting.checked = false;
        loadPastTrainingPlanPreference(false);
        rareExercisesWorkoutLimit = 10;
        rareExercisesWorkoutCount.value = "10";
        rareExercisesSettingsStatus.textContent =
            "Nie udało się pobrać ustawienia z bazy.";
        if (!getCachedHomeShortcutPreferences(currentUserId)) {
            loadHomeShortcutPreferences(DEFAULT_HOME_SHORTCUT_IDS);
        }
    } else {
        groupIdenticalSets = userSettings?.group_identical_sets === true;
        settingsStatus.textContent = "";
        loadPastTrainingPlanPreference(userSettings?.show_past_training_plans);
        const savedWorkoutCount = Number(userSettings?.rare_exercises_workout_count);
        rareExercisesWorkoutLimit =
            Number.isInteger(savedWorkoutCount) && savedWorkoutCount > 0
                ? savedWorkoutCount
                : 10;
        rareExercisesWorkoutCount.value = String(rareExercisesWorkoutLimit);
        rareExercisesSettingsStatus.textContent = "";
        loadHomeShortcutPreferences(userSettings?.home_shortcut_ids);
        await migrateLegacyUserSettings();
        cacheHomeShortcutPreferences(currentUserId, homeShortcutIds);
    }
    groupIdenticalSetsSetting.checked = groupIdenticalSets;


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

    const {
        data: competitionData,
        error: competitionError
    } =
        await supabaseClient
            .from("competitions")
            .select("*")
            .order("competition_date", { ascending: false });

    if (competitionError) {
        console.error("Błąd pobierania zawodów:", competitionError);
        alert("Nie udało się pobrać zawodów. Sprawdź, czy tabele competitions i competition_lifts zostały utworzone w Supabase.");
        return;
    }

    const competitionIds = competitionData.map(competition => competition.id);
    let competitionLiftData = [];

    if (competitionIds.length) {
        const {
            data,
            error
        } = await supabaseClient
            .from("competition_lifts")
            .select("*")
            .in("competition_id", competitionIds);

        if (error) {
            console.error("Błąd pobierania bojów zawodów:", error);
            alert("Nie udało się pobrać wyników zawodów z Supabase.");
            return;
        }

        competitionLiftData = data;
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
    let plannedSetData = [];


    if (
        workoutExerciseIds.length > 0
    ) {

        const pageSize = 500;

        for (
            let from = 0;
            ;
            from += pageSize
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
                        "set_order",
                        { ascending: true }
                    )
                    .order(
                        "id",
                        { ascending: true }
                    )
                    .range(
                        from,
                        from + pageSize - 1
                    );

            if (error) {

                console.error(
                    "Błąd pobierania serii:",
                    error
                );

                return;
            }

            setData.push(...data);

            if (data.length < pageSize) {
                break;
            }
        }

    }

    if (workoutExerciseIds.length > 0) {
        const pageSize = 500;

        for (let from = 0; ; from += pageSize) {
            const { data, error } = await supabaseClient
                .from("planned_sets")
                .select("*")
                .in("workout_exercise_id", workoutExerciseIds)
                .order("set_order", { ascending: true })
                .range(from, from + pageSize - 1);

            if (error) {
                console.error("Błąd pobierania planowanych serii:", error);
                alert("Nie udało się pobrać planowanych serii z Supabase. Sprawdź, czy zastosowano migrację tabeli planned_sets.");
                return;
            }

            plannedSetData.push(...data);
            if (data.length < pageSize) break;
        }
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

                                const exerciseSetRows =
                                    setData.filter(
                                        set =>
                                            set.workout_exercise_id ===
                                            exercise.id
                                    );
                                const sets =
                                    exerciseSetRows
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

                                    plannedSets:
                                        plannedSetData
                                            .filter(set =>
                                                set.workout_exercise_id === exercise.id
                                            )
                                            .map(set => ({ ...set.data })),

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

    competitions = competitionData.map(competition => ({
        id: competition.id,
        name: competition.name,
        date: competition.competition_date,
        lifts: competitionLiftData
            .filter(lift => lift.competition_id === competition.id)
            .map(lift => ({
                id: lift.id,
                liftKey: lift.lift_key,
                attempts: lift.attempts,
                notes: lift.notes || ""
            })),
        notes: competition.notes || ""
    }));


}

/* REFRESH */

function refreshApp() {


populateExerciseFilter();

populateExerciseSelect();

populateGymSelect();

renderWorkouts();

if (!weeklyView.classList.contains("hidden")) {
    renderWeeklyWorkoutList();
}

if (!statisticsView.classList.contains("hidden")) {
    renderStatistics();
}

if (!rareExercisesView.classList.contains("hidden")) {
    renderRareExercises();
}

if (!recordsView.classList.contains("hidden")) {
    renderSbdRecords();
}

if (!trainingPlanView.classList.contains("hidden")) {
    renderTrainingPlanWorkoutList();
    if (activeTrainingPlanWorkoutId !== null) {
        renderTrainingPlanWorkout();
    } else {
        trainingPlanWorkoutListView.classList.remove("hidden");
        trainingPlanWorkoutDetailView.classList.add("hidden");
    }
}

}

refreshApp();


const loginScreen =
    document.getElementById("login-screen");

const loginForm =
    document.getElementById("login-form");

const loginError =
    document.getElementById("login-error");

const applicationLoadingOverlay =
    document.getElementById("applicationLoadingOverlay");

const app =
    document.querySelector(".app");

function isMainScreenVisible() {
    return !app.classList.contains("hidden") &&
        !historyView.classList.contains("hidden") &&
        activeWorkoutView.classList.contains("hidden");
}

function setApplicationLoading(isLoading) {
    const shouldShow = isLoading && isMainScreenVisible();
    applicationLoadingOverlay.classList.toggle("hidden", !shouldShow);
    applicationLoadingOverlay.setAttribute("aria-busy", String(shouldShow));
}


async function checkAuth() {
    try {
        const {
            data: { session },
            error
        } = await supabaseClient.auth.getSession();
        if (error) throw error;

        if (session) {
            loginScreen.classList.remove("active");
            app.classList.remove("hidden");
            currentUserId = session.user.id;
            await loadDataFromSupabase();
        } else {
            loginScreen.classList.add("active");
            app.classList.add("hidden");
            setApplicationLoading(false);
        }
    } catch (error) {
        console.error("Błąd sprawdzania sesji użytkownika:", error);
        loginScreen.classList.add("active");
        app.classList.add("hidden");
        loginError.textContent =
            "Nie udało się sprawdzić sesji. Odśwież stronę lub zaloguj się ponownie.";
        setApplicationLoading(false);
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
            setApplicationLoading(false);
            return;
        }

        if (session) {
            loginScreen.classList.remove("active");
            app.classList.remove("hidden");
            currentUserId = session.user.id;

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
            setApplicationLoading(false);
        }
    }
);

checkAuth();

const logoutButton =
    document.getElementById("logoutButton");

const headerMenu =
    document.getElementById("headerMenu");

headerMenu.addEventListener(
    "click",
    event => {
        if (event.target.closest(".header-menu-items button")) {
            headerMenu.open = false;
        }
    }
);

document.addEventListener(
    "click",
    event => {
        if (!headerMenu.contains(event.target)) {
            headerMenu.open = false;
        }
    }
);

document.addEventListener(
    "keydown",
    event => {
        if (event.key === "Escape" && headerMenu.open) {
            headerMenu.open = false;
            headerMenu.querySelector("summary").focus();
        }
    }
);

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
                plannedSets: (exercise.plannedSets || []).map(({ id, ...set }) => ({ ...set })),
                sets: (exercise.sets || []).map(set => ({
                    data: Object.fromEntries(
                        Object.entries(set).filter(([key]) => key !== "id")
                    )
                }))
            }))
        })),
        competitions: competitions.map(competition => ({
            date: competition.date,
            title: competition.name,
            notes: competition.notes || "",
            lifts: competition.lifts.map(lift => ({
                liftKey: lift.liftKey,
                notes: lift.notes || "",
                attempts: lift.attempts.map(attempt => ({
                    weight: attempt.weight ?? null,
                    result: attempt.result ?? null
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
                : [];
        const importedCompetitions = Array.isArray(json.competitions)
            ? json.competitions
            : [];

        if (!importedWorkouts.length && !importedCompetitions.length) {
            throw new Error("JSON nie zawiera treningów ani zawodów.");
        }

        const errors = [];
        const validWorkouts = [];
        const validCompetitions = [];

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

                if (
                    exercise.plannedSets !== undefined &&
                    !Array.isArray(exercise.plannedSets)
                ) {
                    errors.push(
                        `${label}, ${exercise.name}: pole "plannedSets" musi być tablicą.`
                    );
                    invalid = true;
                } else {
                    (exercise.plannedSets || []).forEach((set, si) => {
                        if (!set || typeof set !== "object" || Array.isArray(set)) {
                            errors.push(
                                `${label}, ${exercise.name}, planowana seria ${si + 1}: niepoprawne dane.`
                            );
                            invalid = true;
                            return;
                        }

                        for (const [key, value] of Object.entries(set)) {
                            if (
                                value !== "" &&
                                value !== null &&
                                value !== undefined &&
                                !Object.keys(FIELD_DEFINITIONS).includes(key)
                            ) {
                                errors.push(
                                    `${label}, ${exercise.name}, planowana seria ${si + 1}: nieznane pole "${key}".`
                                );
                                invalid = true;
                            }

                            if (
                                NUMERIC_SET_FIELDS.includes(key) &&
                                value !== "" &&
                                value !== null &&
                                value !== undefined &&
                                (!(["number", "string"].includes(typeof value)) || !Number.isFinite(Number(value)))
                            ) {
                                errors.push(
                                    `${label}, ${exercise.name}, planowana seria ${si + 1}: "${key}" musi być liczbą.`
                                );
                                invalid = true;
                            }
                        }
                    });
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
                            !Object.keys(FIELD_DEFINITIONS).includes(key)
                        ) {
                            errors.push(
                                `${label}, ${exercise.name}, seria ${si + 1}: nieznane pole "${key}".`
                            );
                            invalid = true;
                        }

                        if (
                            NUMERIC_SET_FIELDS.includes(key) &&
                            value !== "" &&
                            value !== null &&
                            value !== undefined &&
                            (!(["number", "string"].includes(typeof value)) || !Number.isFinite(Number(value)))
                        ) {
                            errors.push(
                                `${label}, ${exercise.name}, seria ${si + 1}: "${key}" musi być liczbą.`
                            );
                            invalid = true;
                        }

                        if (
                            key === "load" &&
                            value !== "" &&
                            value !== null &&
                            value !== undefined &&
                            !Number.isInteger(Number(value))
                        ) {
                            errors.push(
                                `${label}, ${exercise.name}, seria ${si + 1}: "load" musi być liczbą całkowitą.`
                            );
                            invalid = true;
                        }
                    }
                });
            });

            if (!invalid) validWorkouts.push(workout);
        });

        importedCompetitions.forEach((competition, index) => {
            const label = `Zawody ${index + 1}`;

            if (
                !competition ||
                typeof competition.date !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(competition.date) ||
                Number.isNaN(Date.parse(`${competition.date}T00:00:00`))
            ) {
                errors.push(`${label}: niepoprawna data (wymagane RRRR-MM-DD).`);
                return;
            }

            if (typeof competition.title !== "string" || !competition.title.trim()) {
                errors.push(`${label}: brak nazwy.`);
                return;
            }

            if (!Array.isArray(competition.lifts) || !competition.lifts.length) {
                errors.push(`${label}: wybierz przynajmniej jeden bój.`);
                return;
            }

            let invalid = false;
            const liftKeys = new Set();

            competition.lifts.forEach((lift, liftIndex) => {
                const liftLabel = `${label}, bój ${liftIndex + 1}`;

                if (
                    !lift ||
                    !COMPETITION_LIFTS.some(item => item.key === lift.liftKey) ||
                    liftKeys.has(lift.liftKey)
                ) {
                    errors.push(`${liftLabel}: niepoprawny lub powtórzony bój.`);
                    invalid = true;
                    return;
                }
                liftKeys.add(lift.liftKey);

                if (!Array.isArray(lift.attempts) || lift.attempts.length !== 3) {
                    errors.push(`${liftLabel}: wymagane są dokładnie trzy podejścia.`);
                    invalid = true;
                    return;
                }

                lift.attempts.forEach((attempt, attemptIndex) => {
                    if (
                        !attempt ||
                        (attempt.weight !== null &&
                            attempt.weight !== "" &&
                            (!Number.isFinite(Number(attempt.weight)) || Number(attempt.weight) < 0)) ||
                        ![null, "success", "failed"].includes(attempt.result ?? null)
                    ) {
                        errors.push(`${liftLabel}, podejście ${attemptIndex + 1}: niepoprawny ciężar lub wynik.`);
                        invalid = true;
                    }
                });

                if (lift.notes !== undefined && typeof lift.notes !== "string") {
                    errors.push(`${liftLabel}: notatka musi być tekstem.`);
                    invalid = true;
                }
            });

            if (
                competition.notes !== undefined &&
                typeof competition.notes !== "string"
            ) {
                errors.push(`${label}: notatki muszą być tekstem.`);
                invalid = true;
            }

            if (!invalid) validCompetitions.push(competition);
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
        const duplicateCompetitions = validCompetitions.filter(item =>
            competitions.some(existing =>
                existing.date === item.date &&
                existing.name.trim().toLowerCase() === item.title.trim().toLowerCase()
            )
        );

        let toImport = validWorkouts;
        let competitionsToImport = validCompetitions;

        if (duplicates.length || duplicateCompetitions.length) {
            const duplicateKeys = new Set(
                duplicates.map(item =>
                    `workout|${item.date}|${item.title.trim().toLowerCase()}`
                )
            );
            duplicateCompetitions.forEach(item =>
                duplicateKeys.add(
                    `competition|${item.date}|${item.title.trim().toLowerCase()}`
                )
            );

            const skipDuplicates = confirm(
                `Znaleziono ${duplicates.length} treningów i ${duplicateCompetitions.length} zawodów ` +
                `z datą i nazwą pasującą do istniejącej historii.\n\n` +
                `OK — pomiń powtórzone wpisy.\n` +
                `Anuluj — przerwij import.`
            );

            if (!skipDuplicates) return;

            toImport = validWorkouts.filter(item =>
                !duplicateKeys.has(
                    `workout|${item.date}|${item.title.trim().toLowerCase()}`
                )
            );
            competitionsToImport = validCompetitions.filter(item =>
                !duplicateKeys.has(
                    `competition|${item.date}|${item.title.trim().toLowerCase()}`
                )
            );
        }

        if (!toImport.length && !competitionsToImport.length) {
            alert("Nie ma nowych wpisów do zaimportowania.");
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
            `Zawody: ${competitionsToImport.length}\n` +
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

                    const rows = exercise.sets.map((set, setIndex) => {
                            const { id, ...rest } = set.data ?? set;

                            for (const field of NUMERIC_SET_FIELDS) {
                                if (
                                    rest[field] !== "" &&
                                    rest[field] !== null &&
                                    rest[field] !== undefined
                                ) {
                                    rest[field] = Number(rest[field]);
                                }
                            }

                           
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

                    const plannedRows = (exercise.plannedSets || []).map((set, setIndex) => {
                            const { id, ...data } = set;
                            for (const field of NUMERIC_SET_FIELDS) {
                                if (
                                    data[field] !== "" &&
                                    data[field] !== null &&
                                    data[field] !== undefined
                                ) {
                                    data[field] = Number(data[field]);
                                }
                            }

                            if (typeof data.setType === "string") {
                                const option = FIELD_DEFINITIONS.setType.options.find(
                                    value => value.toLowerCase() === data.setType.toLowerCase()
                                );
                                if (option) data.setType = option;
                            }

                            return {
                                workout_exercise_id: savedExercise.id,
                                set_order: setIndex,
                                data
                            };
                        });

                    if (rows.length) {
                        const { error: setsError } =
                            await supabaseClient
                                .from("sets")
                                .insert(rows);

                        if (setsError) throw setsError;
                    }

                    if (plannedRows.length) {
                        const { error: plannedSetsError } =
                            await supabaseClient
                                .from("planned_sets")
                                .insert(plannedRows);

                        if (plannedSetsError) throw plannedSetsError;
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

        let importedCompetitionsCount = 0;

        for (const item of competitionsToImport) {
            let competitionId = null;

            try {
                const { data, error } = await supabaseClient
                    .from("competitions")
                    .insert({
                        user_id: user.id,
                        name: item.title.trim(),
                        competition_date: item.date,
                        notes: item.notes || ""
                    })
                    .select()
                    .single();

                if (error) throw error;
                competitionId = data.id;

                const liftRows = item.lifts.map(lift => ({
                    competition_id: competitionId,
                    lift_key: lift.liftKey,
                    attempts: lift.attempts.map(attempt => ({
                        weight: attempt.weight === null || attempt.weight === ""
                            ? null
                            : Number(attempt.weight),
                        result: attempt.result ?? null
                    })),
                    notes: lift.notes || ""
                }));

                const { error: liftsError } = await supabaseClient
                    .from("competition_lifts")
                    .insert(liftRows);

                if (liftsError) throw liftsError;
                importedCompetitionsCount++;
            } catch (error) {
                console.error("Błąd importu zawodów:", error);

                if (competitionId !== null) {
                    const { error: cleanupError } = await supabaseClient
                        .from("competitions")
                        .delete()
                        .eq("id", competitionId);

                    if (cleanupError) {
                        console.error("Nie udało się wycofać częściowego importu zawodów:", cleanupError);
                    }
                }

                throw new Error(
                    `Import zatrzymał się przy zawodach "${item.title}". ` +
                    `Zapisano wcześniej ${importedCompetitionsCount} zawodów i ${importedCount} treningów. Szczegóły w konsoli.`
                );
            }
        }

        await loadDataFromSupabase();
        alert(
            `Import zakończony. Dodano ${importedCount} treningów i ` +
            `${importedCompetitionsCount} zawodów.`
        );
    } catch (error) {
        console.error("Import JSON:", error);
        alert(error.message || "Nie udało się zaimportować pliku.");
    } finally {
        importJsonButton.disabled = false;
        importJsonFile.value = "";
    }
});