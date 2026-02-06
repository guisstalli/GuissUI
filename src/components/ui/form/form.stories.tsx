/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from '@hookform/resolvers/zod';
import { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '../button';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';
import { FormDrawer } from './form-drawer';
import { Input } from './input';
import { Textarea } from './textarea';

const formSchema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
});

type FormValues = z.infer<typeof formSchema>;

const MyForm = ({ hideSubmit = false }: { hideSubmit?: boolean }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    alert(JSON.stringify(values, null, 2));
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        id="my-form"
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!hideSubmit && (
          <div>
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

const meta: Meta = {
  component: MyForm,
};

export default meta;

type Story = StoryObj<typeof MyForm>;

export const Default: Story = {
  render: () => <MyForm />,
};

export const AsFormDrawer: Story = {
  render: () => (
    <FormDrawer
      triggerButton={<Button>Open Form</Button>}
      isDone={true}
      title="My Form"
      submitButton={
        <Button form="my-form" type="submit">
          Submit
        </Button>
      }
    >
      <MyForm hideSubmit />
    </FormDrawer>
  ),
};
