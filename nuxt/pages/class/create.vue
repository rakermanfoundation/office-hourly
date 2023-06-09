<template>
  <header
    class="flex items-center justify-between border-b border-accent/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
  >
    <h1 class="text-base font-semibold leading-7 text-neutral">Create Class</h1>
  </header>

  <Notification
    :show="isIssuesNote"
    title="Invalid Class"
    :desc="
      'We found ' +
      issues.length +
      ' issue' +
      (issues.length === 1 ? '' : 's') +
      ' preventing your class from being saved. Please correct and try again.'
    "
    @close="isIssuesNote = false"
  />

  <div
    class="w-full relative mx-auto max-w-3xl px-6 lg:max-w-7xl lg:px-8 pb-10 pt-6"
  >
    <div class="space-y-6 divide-y divide-neutral">
      <div class="space-y-8 divide-y divide-neutral sm:space-y-5">
        <div class="space-y-6 sm:space-y-5">
          <FormHeader
            title="Class Details"
            desc="This information will be displayed publicly to all students and instructors."
          />

          <div class="space-y-6 sm:space-y-5">
            <div
              class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-neutral sm:pt-5"
            >
              <label
                for="title"
                class="block text-sm font-medium text-neutral sm:mt-px sm:pt-2"
              >
                Title*
              </label>
              <div class="mt-1 sm:col-span-2 sm:mt-0">
                <input
                  type="text"
                  name="title"
                  id="title"
                  v-model="payload.title"
                  class="block w-full max-w-lg rounded-md bg-primary-focus border-accent shadow-sm focus:border-secondary focus:ring-secondary sm:max-w-xs sm:text-sm"
                />
                <FormIssues :issues="issues" field="title" />
              </div>
            </div>

            <div
              class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-neutral sm:pt-5"
            >
              <label
                for="number"
                class="block text-sm font-medium text-neutral sm:mt-px sm:pt-2"
              >
                Number*
              </label>
              <div class="mt-1 sm:col-span-2 sm:mt-0">
                <input
                  type="text"
                  name="number"
                  id="number"
                  v-model="payload.number"
                  class="block w-full max-w-lg rounded-md bg-primary-focus border-accent shadow-sm focus:border-secondary focus:ring-secondary sm:max-w-xs sm:text-sm"
                />
                <FormIssues :issues="issues" field="number" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-5">
        <div class="flex justify-end">
          <NuxtLink
            to="/classes"
            type="button"
            class="rounded-md border bg-primary-focus border-accent py-2 px-4 text-sm font-medium text-neutral shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
          >
            Cancel
          </NuxtLink>
          <button
            @click="sendForm"
            type="button"
            class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-secondary py-2 px-4 text-sm font-medium text-neutral shadow-sm hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            :class="{
              'opacity-50 bg-primary-focus hover:bg-primary-focus':
                isSubmitting,
            }"
            :disabled="isSubmitting"
          >
            <svg
              class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              v-if="isSubmitting"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ isSubmitting ? "Submitting..." : "Everything looks good!" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DateTime } from "luxon";
import { ChevronRightIcon } from "@heroicons/vue/20/solid";

definePageMeta({
  middleware: ["enforce-auth"],
  layout: "dash",
});

const config = useRuntimeConfig();

let { auth, isAuth, token, userAuth0, userAuthor } = await getAuth0();

const issues = reactive([]);

let payload = reactive({
  title: "",
  number: "",
});

let isCreating = ref(true);
let isSubmitting = ref(false);
let isIssuesNote = ref(false);

let sendForm = async () => {
  isSubmitting.value = true;
  const { data, error } = await useFetch("/classes", {
    method: isCreating.value ? "POST" : "PUT",
    server: false, // not to Nitro
    baseURL: config.urlBase.back, // backend url
    headers: {
      // auth headers
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(payload),
  });
  // Reset and construct form field issues
  issues.length = 0;
  if (error.value) {
    // Add issues to issues array
    error.value.response._data.error.issues.forEach((issue) => {
      issue.path.forEach((pth) => {
        issues.push({
          field: pth,
          message: issue.message,
        });
      });
    });
    isIssuesNote.value = true;
  } else {
    return navigateTo("/class/" + data.value.ref);
  }
  isSubmitting.value = false;
};
</script>