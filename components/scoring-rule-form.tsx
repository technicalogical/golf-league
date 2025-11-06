'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreateScoringRuleRequest,
  HandicapMethod,
  StrokeHoles,
  PointMethod,
  TeamFormat,
  PairingMethod,
  HANDICAP_METHODS,
  STROKE_HOLES,
  POINT_METHODS,
  TEAM_FORMATS,
} from '@/lib/types/scoring';

interface ScoringRuleFormProps {
  initialData?: Partial<CreateScoringRuleRequest>;
  onSubmit: (data: CreateScoringRuleRequest) => Promise<void>;
  submitLabel?: string;
  isEdit?: boolean;
}

const PAIRING_METHODS: { value: PairingMethod; label: string; description: string }[] = [
  {
    value: 'lowest_vs_lowest',
    label: 'Lowest vs Lowest',
    description: 'Pair lowest handicap players against each other',
  },
  {
    value: 'random',
    label: 'Random',
    description: 'Random pairing each round',
  },
  {
    value: 'captain_choice',
    label: 'Captain Choice',
    description: 'Team captains select pairings',
  },
];

export default function ScoringRuleForm({
  initialData,
  onSubmit,
  submitLabel = 'Create Scoring Rule',
  isEdit = false,
}: ScoringRuleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handicapMethod, setHandicapMethod] = useState<HandicapMethod>(
    initialData?.handicap_method || 'full'
  );
  const [strokeHoles, setStrokeHoles] = useState<StrokeHoles>(
    initialData?.stroke_holes || 'handicap_order'
  );
  const [customStrokeHoles, setCustomStrokeHoles] = useState<string>(
    initialData?.custom_stroke_holes?.join(',') || ''
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateScoringRuleRequest>({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      handicap_method: initialData?.handicap_method || 'full',
      handicap_percentage: initialData?.handicap_percentage || 100,
      max_handicap_difference: initialData?.max_handicap_difference || 5,
      stroke_holes: initialData?.stroke_holes || 'handicap_order',
      max_strokes_per_hole: initialData?.max_strokes_per_hole || 2,
      custom_stroke_holes: initialData?.custom_stroke_holes || [],
      point_method: initialData?.point_method || 'match_play',
      hole_points: initialData?.hole_points || 1,
      match_bonus_points: initialData?.match_bonus_points || 0,
      tie_points: initialData?.tie_points || 0.5,
      team_format: initialData?.team_format || 'heads_up',
      pairing_method: initialData?.pairing_method || 'lowest_vs_lowest',
    },
  });

  const handleFormSubmit = async (data: CreateScoringRuleRequest) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Parse custom stroke holes if using custom method
      if (strokeHoles === 'custom' && customStrokeHoles) {
        const holes = customStrokeHoles
          .split(',')
          .map((h) => parseInt(h.trim(), 10))
          .filter((h) => !isNaN(h) && h >= 1 && h <= 18);

        if (holes.length === 0) {
          setError('Please enter valid hole numbers (1-18) separated by commas');
          setIsSubmitting(false);
          return;
        }

        data.custom_stroke_holes = holes;
      }

      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || 'Failed to save scoring rule');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Give your scoring rule a name and description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Rule Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Rule name is required' })}
              placeholder="e.g., Standard Match Play"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Optional description of this scoring rule"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Handicap Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Handicap Configuration</CardTitle>
          <CardDescription>
            Configure how handicaps are applied in matches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="handicap_method">Handicap Method *</Label>
            <Select
              value={handicapMethod}
              onValueChange={(value: HandicapMethod) => {
                setHandicapMethod(value);
                setValue('handicap_method', value);
              }}
            >
              <SelectTrigger id="handicap_method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HANDICAP_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex flex-col items-start">
                      <div className="font-medium">{method.label}</div>
                      <div className="text-xs text-gray-500">{method.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {handicapMethod === 'percentage' && (
            <div>
              <Label htmlFor="handicap_percentage">Handicap Percentage *</Label>
              <Input
                id="handicap_percentage"
                type="number"
                min="1"
                max="100"
                {...register('handicap_percentage', {
                  required: 'Handicap percentage is required',
                  min: { value: 1, message: 'Must be at least 1%' },
                  max: { value: 100, message: 'Must be at most 100%' },
                  valueAsNumber: true,
                })}
              />
              {errors.handicap_percentage && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.handicap_percentage.message}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Percentage of handicap difference to use (e.g., 80% for 80% handicap)
              </p>
            </div>
          )}

          {handicapMethod === 'cap_difference' && (
            <div>
              <Label htmlFor="max_handicap_difference">Max Handicap Difference *</Label>
              <Input
                id="max_handicap_difference"
                type="number"
                min="1"
                max="18"
                {...register('max_handicap_difference', {
                  required: 'Max handicap difference is required',
                  min: { value: 1, message: 'Must be at least 1' },
                  max: { value: 18, message: 'Must be at most 18' },
                  valueAsNumber: true,
                })}
              />
              {errors.max_handicap_difference && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.max_handicap_difference.message}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Maximum number of strokes difference allowed between players
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stroke Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Stroke Allocation</CardTitle>
          <CardDescription>
            Configure which holes receive handicap strokes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="stroke_holes">Stroke Holes *</Label>
            <Select
              value={strokeHoles}
              onValueChange={(value: StrokeHoles) => {
                setStrokeHoles(value);
                setValue('stroke_holes', value);
              }}
            >
              <SelectTrigger id="stroke_holes">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STROKE_HOLES.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex flex-col items-start">
                      <div className="font-medium">{method.label}</div>
                      <div className="text-xs text-gray-500">{method.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {strokeHoles === 'custom' && (
            <div>
              <Label htmlFor="custom_stroke_holes">Custom Stroke Holes *</Label>
              <Input
                id="custom_stroke_holes"
                value={customStrokeHoles}
                onChange={(e) => setCustomStrokeHoles(e.target.value)}
                placeholder="e.g., 1,3,5,7,9,11,13,15,17"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter hole numbers (1-18) separated by commas
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="max_strokes_per_hole">Max Strokes Per Hole *</Label>
            <Input
              id="max_strokes_per_hole"
              type="number"
              min="1"
              max="3"
              {...register('max_strokes_per_hole', {
                required: 'Max strokes per hole is required',
                min: { value: 1, message: 'Must be at least 1' },
                max: { value: 3, message: 'Must be at most 3' },
                valueAsNumber: true,
              })}
            />
            {errors.max_strokes_per_hole && (
              <p className="text-sm text-red-500 mt-1">
                {errors.max_strokes_per_hole.message}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Maximum number of handicap strokes a player can receive on a single hole
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Point System */}
      <Card>
        <CardHeader>
          <CardTitle>Point System</CardTitle>
          <CardDescription>
            Configure how points are awarded for holes and matches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="point_method">Point Method *</Label>
            <Select
              defaultValue={initialData?.point_method || 'match_play'}
              onValueChange={(value: PointMethod) => setValue('point_method', value)}
            >
              <SelectTrigger id="point_method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POINT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex flex-col items-start">
                      <div className="font-medium">{method.label}</div>
                      <div className="text-xs text-gray-500">{method.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hole_points">Points Per Hole Won *</Label>
            <Input
              id="hole_points"
              type="number"
              min="0"
              step="0.5"
              {...register('hole_points', {
                required: 'Hole points is required',
                min: { value: 0, message: 'Must be non-negative' },
                valueAsNumber: true,
              })}
            />
            {errors.hole_points && (
              <p className="text-sm text-red-500 mt-1">{errors.hole_points.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="tie_points">Points Per Tied Hole *</Label>
            <Input
              id="tie_points"
              type="number"
              min="0"
              step="0.5"
              {...register('tie_points', {
                required: 'Tie points is required',
                min: { value: 0, message: 'Must be non-negative' },
                valueAsNumber: true,
              })}
            />
            {errors.tie_points && (
              <p className="text-sm text-red-500 mt-1">{errors.tie_points.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="match_bonus_points">Match Bonus Points</Label>
            <Input
              id="match_bonus_points"
              type="number"
              min="0"
              step="0.5"
              {...register('match_bonus_points', {
                min: { value: 0, message: 'Must be non-negative' },
                valueAsNumber: true,
              })}
            />
            {errors.match_bonus_points && (
              <p className="text-sm text-red-500 mt-1">
                {errors.match_bonus_points.message}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Bonus points awarded to the player with the lowest total score (optional)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Team Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Team Configuration</CardTitle>
          <CardDescription>
            Configure team format and pairing method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="team_format">Team Format *</Label>
            <Select
              defaultValue={initialData?.team_format || 'heads_up'}
              onValueChange={(value: TeamFormat) => setValue('team_format', value)}
            >
              <SelectTrigger id="team_format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEAM_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex flex-col items-start">
                      <div className="font-medium">{format.label}</div>
                      <div className="text-xs text-gray-500">{format.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="pairing_method">Pairing Method *</Label>
            <Select
              defaultValue={initialData?.pairing_method || 'lowest_vs_lowest'}
              onValueChange={(value: PairingMethod) => setValue('pairing_method', value)}
            >
              <SelectTrigger id="pairing_method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAIRING_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex flex-col items-start">
                      <div className="font-medium">{method.label}</div>
                      <div className="text-xs text-gray-500">{method.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
